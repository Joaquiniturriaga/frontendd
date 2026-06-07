import { useState, useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { useReports } from '../hooks/useReports'
import { useLocation } from '../hooks/useLocation'
import { usePolling } from '../hooks/usePolling'
import { useAuth } from '../hooks/useAuth'
import { useCallback } from 'react'
import {
  getActiveBrigades,
  brigadeRespond,
  updateBrigadeLocation,
} from '../api/user.api'

import { apiFetch } from '../api/client'

import { haversineKm } from '../utils/geo'

import '../styles/pages/MapPage.css'

const centro = [-34.1703, -70.7431]

const TIPOS = [
  { value: 'INCENDIO',   label: '🔥 Incendio activo' },
  { value: 'ACCIDENTE',  label: '🚗 Accidente'        },
  { value: 'DERRUMBE',   label: '⛰️ Derrumbe'         },
  { value: 'INUNDACION', label: '💧 Inundación'       },
]


const iconoPorTipo = (tipo) => {
  const MAP = {
    INCENDIO:   { clase: 'incendio', letra: 'I' },
    ACCIDENTE:  { clase: 'foco',     letra: 'A' },
    DERRUMBE:   { clase: 'otro',     letra: 'D' },
    INUNDACION: { clase: 'otro',     letra: '~' },
    // compat con reportes viejos que tengan FOCO/HUMO en DB
    FOCO:       { clase: 'foco',     letra: 'F' },
    HUMO:       { clase: 'otro',     letra: 'H' },
  }
  const { clase, letra } = MAP[tipo] ?? { clase: 'otro', letra: 'O' }
  return L.divIcon({
    html: `<div class="map-marker map-marker--${clase}">${letra}</div>`,
    className: '',
    iconAnchor: [14, 14],
  })
}


const iconoCamion = L.divIcon({
  html: `<div class="map-marker map-marker--camion">🚒</div>`,
  className: '',
  iconAnchor: [14, 14],
})

const iconoPendiente = L.divIcon({
  html: `<div class="map-marker map-marker--pendiente">+</div>`,
  className: '',
  iconAnchor: [14, 14],
})

const iconoUsuario = L.divIcon({
  html: `<div class="map-marker map-marker--usuario">📍</div>`,
  className: '',
  iconAnchor: [14, 28],
})

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })

  return null
}

function MapCenterer({ location }) {
  const map = useMap()
  const centered = useRef(false)

  useEffect(() => {
    if (location && !centered.current) {
      map.setView([location.lat, location.lng], 14)
      centered.current = true
    }
  }, [location, map])

  return null
}

export default function MapPage() {
  const { reports, loading, addReport, refetch } = useReports()
  const { userLocation } = useLocation()
  const { user } = useAuth()
const [respondError, setRespondError] = useState({})
  useEffect(() => {
    console.log("👤 user:", JSON.stringify(user, null, 2))
  }, [user])

  const [pending, setPending] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    tipo: 'INCENDIO',
  })

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [activeBrigades, setActiveBrigades] = useState([])

  const [responding, setResponding] = useState(false)
const [updatingStatus, setUpdatingStatus] = useState(false)

const fetchBrigades = useCallback(async () => {
  try {
    const data = await getActiveBrigades()

    if (Array.isArray(data) && data.length > 0) {
      // JSON.stringify para ver campos reales, no "Object"
      console.log("🔍 Brigada RAW:", JSON.stringify(data[0], null, 2))
    } else {
      console.log("🔍 getActiveBrigades devolvió:", JSON.stringify(data))
    }

    setActiveBrigades(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error("❌ fetchBrigades error:", err.message)
  }
}, [])

  usePolling(fetchBrigades, 60000)

  const handleMapClick = (lat, lng) => {
    setPending({ lat, lng })
    setForm({
      title: '',
      description: '',
      tipo: 'INCENDIO',
    })
    setFormError(null)
  }

const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      setFormError('Title is required')
      return
    }

    setSubmitting(true)

    try {
      await addReport(
        form.title,
        form.description,
        pending.lat,
        pending.lng,
        form.tipo
      )
      setPending(null)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

const handleRespond = async (reportId) => {
  setResponding(true)
  setRespondError(prev => ({ ...prev, [reportId]: null }))

  try {
    await brigadeRespond(reportId, 'EN_CAMINO')
    if (userLocation) {
      await updateBrigadeLocation(reportId, userLocation.lat, userLocation.lng)
    }
    refetch()
    setTimeout(() => fetchBrigades(), 500)
  } catch (err) {
    setRespondError(prev => ({
      ...prev,
      [reportId]: err.message ?? 'Error al responder'
    }))
    console.error('brigadeRespond falló:', err)
  } finally {
    setResponding(false)
  }
}
  const handleUpdateReportStatus = async (reportId, status) => {
    setUpdatingStatus(true)

    try {
      await apiFetch(`/api/reports/${reportId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })

      refetch()
    } catch (err) {
      console.error(err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div className="map-container">
      {loading && (
        <p className="map-loading">Loading reports...</p>
      )}

{pending && (
  <div className="map-form-overlay">
    <p className="map-form-coords">
      📍 {pending.lat.toFixed(4)}, {pending.lng.toFixed(4)}
    </p>
    <form onSubmit={handleSubmit} className="map-form">
      <select
        value={form.tipo}
        onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
        className="map-form-select"
      >
        {TIPOS.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <input
        placeholder="Título *"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        className="map-form-input"
        required
      />
      <input
        placeholder="Descripción (opcional)"
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        className="map-form-input"
      />
      {formError && <p className="map-form-error">{formError}</p>}
      <div className="map-form-actions">
        <button
          type="button"
          className="map-form-cancel"
          onClick={() => setPending(null)}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="map-form-submit"
          disabled={submitting}
        >
          {submitting ? 'Enviando...' : 'Reportar'}
        </button>
      </div>
    </form>
  </div>
)}
      <MapContainer
        center={
          userLocation
            ? [userLocation.lat, userLocation.lng]
            : centro
        }
        zoom={13}
        className="map-tile"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <ClickHandler onMapClick={handleMapClick} />

        <MapCenterer location={userLocation} />

{reports.map((r) => {
  // Busca si alguna brigada está respondiendo este reporte
  const brigada = activeBrigades.find(b => b.report_id === r.id)

  return (
    <Marker key={r.id} position={[r.lat, r.lng]} icon={iconoPorTipo(r.tipo)}>
      <Popup>
        <p className="map-popup-title">{r.title}</p>
        <p className="map-popup-desc">{r.description}</p>
        <small className="map-popup-meta">{r.status}</small>

        {/* Brigada respondiendo — aparece automáticamente después del respond */}
        {brigada && (
          <p className="map-brigade-info">
            🚒 {brigada.brigade_nombre}
            <span className="map-brigade-estado">
              {brigada.estado.replace('_', ' ')}
            </span>
          </p>
        )}

        {user?.brigade_id && r.status === 'ACTIVE' && (
          <>
            <button
              className="map-respond-btn"
              disabled={responding}
              onClick={() => handleRespond(r.id)}
            >
              {responding ? 'Enviando...' : 'Responder'}
            </button>
            {respondError[r.id] && (
              <p style={{ color: '#ef4444', fontSize: 11, margin: '4px 0 0' }}>
                ❌ {respondError[r.id]}
              </p>
            )}
          </>
        )}

        {user?.brigade_id && (
          <div className="map-status-actions">
            {r.status !== 'CONTROLLED' && (
              <button className="map-status-btn map-status-btn--controlled"
                disabled={updatingStatus}
                onClick={() => handleUpdateReportStatus(r.id, 'CONTROLLED')}>
                Controlado
              </button>
            )}
            {r.status !== 'REVIEWED' && (
              <button className="map-status-btn map-status-btn--reviewed"
                disabled={updatingStatus}
                onClick={() => handleUpdateReportStatus(r.id, 'REVIEWED')}>
                Revisado
              </button>
            )}
            {r.status !== 'DISMISSED' && (
              <button className="map-status-btn map-status-btn--dismissed"
                disabled={updatingStatus}
                onClick={() => handleUpdateReportStatus(r.id, 'DISMISSED')}>
                Descartar
              </button>
            )}
          </div>
        )}
      </Popup>
    </Marker>
  )
})}

{activeBrigades.map((b) => (
  <Marker
    key={b.id}
    position={[parseFloat(b.lat), parseFloat(b.lng)]}
    icon={iconoCamion}
  >
    <Popup>
      <p>🚒 {b.brigade_nombre}</p>
    </Popup>
  </Marker>
))}
        {userLocation && (
          <Marker
            position={[
              userLocation.lat,
              userLocation.lng,
            ]}
            icon={iconoUsuario}
          >
            <Popup>📍 You are here</Popup>
          </Marker>
        )}

        {pending && (
          <Marker
            position={[pending.lat, pending.lng]}
            icon={iconoPendiente}
          />
        )}
      </MapContainer>
    </div>
  )
}