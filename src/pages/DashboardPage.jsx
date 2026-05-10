import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useReports } from "../hooks/useReports"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/pages/HomePages.css'

const TIPOS = [
  { value: 'INCENDIO', label: '🔥 Incendio activo' },
  { value: 'FOCO',     label: '⚠️ Foco pequeño' },
  { value: 'HUMO',     label: '💨 Humo visible' },
]

const centro = [-34.1703, -70.7431]

const iconoPorTipo = (tipo) => {
  const emoji = tipo === 'INCENDIO' ? '🔥' : tipo === 'FOCO' ? '⚠️' : '💨'
  return L.divIcon({
    html: `<div style="font-size:24px;line-height:1">${emoji}</div>`,
    className: '',
    iconAnchor: [12, 12],
  })
}

export default function DashboardPage() {
  const { reports, loading, error, addReport } = useReports()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [tipo, setTipo] = useState('INCENDIO')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addReport(title, description, parseFloat(lat), parseFloat(lng), tipo)
      setTitle('')
      setDescription('')
      setLat('')
      setLng('')
      setTipo('INCENDIO')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-body">

          {/* Columna izquierda — formulario + lista */}
          <div className="home-sidebar">
            <h1 style={{ fontSize: '20px', marginBottom: '12px' }}>Reportes</h1>

            <p className="home-buttons-label">Crear reporte</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                {TIPOS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                placeholder="Título"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                placeholder="Descripción"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                placeholder="Latitud (ej: -33.4569)"
                value={lat}
                onChange={e => setLat(e.target.value)}
                required
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                placeholder="Longitud (ej: -70.6483)"
                value={lng}
                onChange={e => setLng(e.target.value)}
                required
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '10px', backgroundColor: '#cc2200', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {submitting ? 'Enviando...' : 'Crear reporte'}
              </button>
            </form>

            <p className="home-buttons-label" style={{ marginTop: '16px' }}>Reportes activos</p>
            {loading && <p>Cargando...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
              {reports.map(r => (
                <div key={r.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', backgroundColor: 'white' }}>
                  <strong>{r.tipo === 'INCENDIO' ? '🔥' : r.tipo === 'FOCO' ? '⚠️' : '💨'} {r.title}</strong>
                  <p style={{ margin: '4px 0', fontSize: '13px' }}>{r.description}</p>
                  <small style={{ color: '#888' }}>📍 {r.lat}, {r.lng} — {r.status}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="home-map-wrapper">
            <p className="home-map-label">Mapa de incendios — clic para ver completo</p>
            <div
              className="home-map"
              onClick={() => navigate('/map')}
              style={{ cursor: 'pointer' }}
            >
              <MapContainer
                center={centro}
                zoom={10}
                className="home-map__tile"
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {reports.map(r => (
                  <Marker key={r.id} position={[r.lat, r.lng]} icon={iconoPorTipo(r.tipo)}>
                    <Popup>{r.title}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}