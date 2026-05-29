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
  { value: 'INCENDIO', label: '🔥 Incendio activo' },
  { value: 'FOCO', label: '⚠️ Foco pequeño' },
  { value: 'HUMO', label: '💨 Humo visible' },
]

const iconoPorTipo = (tipo) => {
  const clase =
    tipo === 'INCENDIO'
      ? 'incendio'
      : tipo === 'FOCO'
      ? 'foco'
      : 'otro'

  const letra =
    tipo === 'INCENDIO'
      ? 'I'
      : tipo === 'FOCO'
      ? 'F'
      : 'O'

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

  usePolling(() => {
    getActiveBrigades()
      .then((data) => {
        setActiveBrigades(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
  }, 60000)

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

    try {
      await brigadeRespond(reportId, 'EN_CAMINO')

      if (userLocation) {
        await updateBrigadeLocation(
          reportId,
          userLocation.lat,
          userLocation.lng
        )
      }

      refetch()
    } catch (err) {
      console.error(err.message)
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

        {reports.map((r) => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={iconoPorTipo(r.tipo)}
          >
            <Popup>
              <p className="map-popup-title">
                {r.title}
              </p>

              <p className="map-popup-desc">
                {r.description}
              </p>

              <small className="map-popup-meta">
                {r.status}
              </small>

              {user?.brigade_id && r.status === 'ACTIVE' && (
                <button
                  className="map-respond-btn"
                  disabled={responding}
                  onClick={() => handleRespond(r.id)}
                >
                  {responding
                    ? 'Enviando...'
                    : 'Responder'}
                </button>
              )}

              {user?.brigade_id && (
                <div className="map-status-actions">
                  {r.status !== 'CONTROLLED' && (
                    <button
                      className="map-status-btn map-status-btn--controlled"
                      disabled={updatingStatus}
                      onClick={() =>
                        handleUpdateReportStatus(
                          r.id,
                          'CONTROLLED'
                        )
                      }
                    >
                      Controlado
                    </button>
                  )}

                  {r.status !== 'REVIEWED' && (
                    <button
                      className="map-status-btn map-status-btn--reviewed"
                      disabled={updatingStatus}
                      onClick={() =>
                        handleUpdateReportStatus(
                          r.id,
                          'REVIEWED'
                        )
                      }
                    >
                      Revisado
                    </button>
                  )}

                  {r.status !== 'DISMISSED' && (
                    <button
                      className="map-status-btn map-status-btn--dismissed"
                      disabled={updatingStatus}
                      onClick={() =>
                        handleUpdateReportStatus(
                          r.id,
                          'DISMISSED'
                        )
                      }
                    >
                      Descartar
                    </button>
                  )}
                </div>
              )}
            </Popup>
          </Marker>
        ))}

        {activeBrigades.map((b) => (
          <Marker
            key={b.id}
            position={[b.lat, b.lng]}
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