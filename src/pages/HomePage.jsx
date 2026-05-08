
import '../styles/pages/HomePages.css'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import ActionButton from '../components/ActionButton/ActionButton'



const centro = [-33.4489, -70.6693]

const botones = [
  {
    label: 'Reportar incendio',
    sub: 'Hay un incendio activo ahora',
    variant: 'red',
    ruta: '/reportar',
  },
  {
    label: 'Posible foco de incendio',
    sub: 'Vi algo sospechoso',
    variant: 'orange',
    ruta: '/foco',
  },
  {
    label: 'Ver mapa de incendios',
    sub: 'Incendios activos en tu zona',
    variant: 'dark',
    ruta: '/mapa',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

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
            <p className="home-map-label">Tu ubicación actual</p>
            <div className="home-map">
              <MapContainer
                center={centro}
                zoom={13}
                className="home-map__tile"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={centro}>
                  <Popup>Tu ubicación</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}