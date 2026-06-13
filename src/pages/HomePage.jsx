import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { IconAlertTriangle, IconArrowsMaximize, IconFlame, IconMap } from '@tabler/icons-react'
import { useReports } from '../hooks/useReports'
import { useLocation } from '../hooks/useLocation'
import '../styles/pages/HomePages.css'

const iconoPorTipo = (tipo) => {
  const color = tipo === 'INCENDIO' ? '#ef4444' : tipo === 'FOCO' ? '#f97316' : '#6b7280'
  const letra = tipo === 'INCENDIO' ? 'I' : tipo === 'FOCO' ? 'F' : 'H'
  return L.divIcon({
    html: `<div class="home-marker home-marker--fire" style="background:${color}">${letra}</div>`,
    className: '',
    iconAnchor: [16, 16],
  })
}

const iconoUsuario = L.divIcon({
  html: `<div class="home-marker home-marker--user">●</div>`,
  className: '',
  iconAnchor: [12, 12],
})

const centro = [-34.1703, -70.7431]

const ACCIONES = [
  { icon: 'ti-flame',          label: 'Report a fire',        sub: 'Active fire right now',    variant: 'red',    ruta: '/map' },
  { icon: 'ti-alert-triangle', label: 'Possible fire source', sub: 'Suspicious smoke or glow', variant: 'orange', ruta: '/map' },
  { icon: 'ti-map',            label: 'View fire map',        sub: 'Active fires in your area', variant: 'dark',  ruta: '/map' },
]

function MapCenterer({ location }) {
  const map = useMap()
  const centered = useRef(false)
  useEffect(() => {
    if (location && !centered.current) {
      map.setView([location.lat, location.lng], 13)
      centered.current = true
    }
  }, [location, map])
  return null
}

export default function HomePage() {
  const navigate = useNavigate()
  const { reports } = useReports()
  const { userLocation, nearbyAlerts, newAlert, locationError, requestLocation, dismissAlert } = useLocation()

  return (
    <div className="home-container">

      {/* ── Toast ───────────────────────────────── */}
      {newAlert && (
        <div className="home-toast">
          <div className="home-toast-left">
            <span className="home-toast-pulse" />
            <div>
              <p className="home-toast-title">Fire nearby!</p>
              <p className="home-toast-sub">{newAlert.report_title} — {parseFloat(newAlert.distance_km).toFixed(1)} km away</p>
            </div>
          </div>
          <button className="home-toast-close" onClick={dismissAlert} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* ── Alert banner ────────────────────────── */}
      {nearbyAlerts.length > 0 && !newAlert && (
        <div className="home-alert-banner">
          <span className="home-banner-pulse" />
          {nearbyAlerts.length} active incident{nearbyAlerts.length > 1 ? 's' : ''} within 5 km of your location
        </div>
      )}

      {/* ── Location bar ────────────────────────── */}
      <div className="home-location-bar">
        {locationError ? (
          <span className="home-loc-error">
            Location unavailable —{' '}
            <button className="home-loc-retry" onClick={requestLocation}>Enable location</button>
          </span>
        ) : userLocation ? (
          <span className="home-loc-ok">
            <span className="home-loc-dot" />
            Location active — {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        ) : (
          <span className="home-loc-loading">Requesting location...</span>
        )}
      </div>

      {/* ── Body ────────────────────────────────── */}
      <div className="home-body">

        {/* Sidebar */}
        <div className="home-sidebar">
          <div>
            <p className="home-section-label">Actions</p>
            <div className="home-actions">
              {ACCIONES.map(({ icon, label, sub, variant, ruta }) => (
                <button
                  key={label}
                  className={`home-action-btn home-action-btn--${variant}`}
                  onClick={() => navigate(ruta)}
                >
                  <div className={`home-action-icon home-action-icon--${variant}`}>
                    {icon === 'ti-flame' && <IconFlame size={18} />}
                    {icon === 'ti-alert-triangle' && <IconAlertTriangle size={18} />}
                    {icon === 'ti-map' && <IconMap size={18} />}
                  </div>
                  <div>
                    <p className="home-action-label">{label}</p>
                    <p className="home-action-sub">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {nearbyAlerts.length > 0 && (
            <div className="home-alerts-section">
              <p className="home-section-label">Nearby alerts</p>
              {nearbyAlerts.slice(0, 3).map(a => (
                <div key={a.id} className="home-alert-item">
                  <span className="home-alert-title">
                    <i className="ti ti-flame" style={{ fontSize: 14 }} aria-hidden="true" />
                    {a.report_title}
                  </span>
                  <span className="home-alert-dist">{parseFloat(a.distance_km).toFixed(1)} km</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="home-map-wrap" onClick={() => navigate('/map')} style={{ cursor: 'pointer' }}>
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : centro}
            zoom={12}
            className="home-map-tile"
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapCenterer location={userLocation} />

            {reports.map(r => (
              <Marker key={r.id} position={[r.lat, r.lng]} icon={iconoPorTipo(r.tipo)}>
                <Popup>{r.title}</Popup>
              </Marker>
            ))}

            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={iconoUsuario}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Legend */}
          <div className="home-map-legend">
            <div className="home-legend-row"><span className="home-legend-dot" style={{ background: '#ef4444' }} />Fire report</div>
            <div className="home-legend-row"><span className="home-legend-dot" style={{ background: '#3b82f6' }} />Your location</div>
          </div>

          <p className="home-map-hint">
            <IconArrowsMaximize size={13} style={{ marginRight: 4 }} aria-hidden="true" />
            Click to open full map
          </p>
        </div>

      </div>
    </div>
  )
}