
import '../styles/pages/HomePages.css'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useReports } from '../hooks/useReports'

import L from 'leaflet'

import ActionButton from '../components/ActionButton/ActionButton'



const centro = [-34.1703, -70.7431]

const botones = [
  { label: 'Reportar incendio',      sub: 'Hay un incendio activo ahora', variant: 'red',    ruta: '/dashboard' },
  { label: 'Posible foco de incendio', sub: 'Vi algo sospechoso',         variant: 'orange', ruta: '/dashboard' },
  { label: 'Ver mapa de incendios',  sub: 'Incendios activos en tu zona', variant: 'dark',   ruta: '/map' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { reports } = useReports()

  return (
    <div className="home-container">


      <div className="home-content">
        <div className="home-body">

          <div className="home-sidebar">
            <p className="home-buttons-label">¿Qué quieres hacer?</p>
            <div className="home-buttons">
              {botones.map(({ label, sub, icon, variant, ruta }) => (
                <ActionButton
                  key={ruta}
                  label={label}
                  sub={sub}
                  icon={icon}
                  variant={variant}
                  onClick={() => navigate(ruta)}
                />
              ))}
            </div>
          </div>

          {/* Mapa — en móvil queda abajo, en desktop ocupa el resto */}
          <div className="home-map-wrapper">
            <p className="home-map-label">Active fires in the region</p>
            <div className="home-map" onClick={() => navigate('/map')} style={{ cursor: 'pointer' }}>
              <MapContainer
                center={centro}
                zoom={10}
                className="home-map__tile"
                zoomControl={false}
                dragging={false}        
                scrollWheelZoom={false} 
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {reports.map(r => (
                <Marker key={r.id} position={[r.lat, r.lng]}>
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