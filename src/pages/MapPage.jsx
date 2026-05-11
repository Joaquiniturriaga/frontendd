import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useReports } from '../hooks/useReports'
import '../styles/pages/MapPage.css'

const centro = [-34.1703, -70.7431]

const iconoPorTipo = (tipo) => {
  const clase = tipo === 'INCENDIO' ? 'incendio' : tipo === 'FOCO' ? 'foco' : 'otro'
  const letra = tipo === 'INCENDIO' ? 'I' : tipo === 'FOCO' ? 'F' : 'O'

  return L.divIcon({
    html: `<div class="map-marker map-marker--${clase}">${letra}</div>`,
    className: '',
    iconAnchor: [14, 14],
  })
}

const labelPorTipo = (tipo) => {
  if (tipo === 'INCENDIO') return 'Incendio'
  if (tipo === 'FOCO') return 'Foco de incendio'
  return 'Otro'
}

export default function MapPage() {
  const { reports, loading } = useReports()

  return (
    <div className="map-container">
      {loading && <p className="map-loading">Cargando reportes...</p>}
      <MapContainer
        center={centro}
        zoom={10}
        className="map-tile"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {reports.map(r => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={iconoPorTipo(r.tipo)}>
            <Popup>
              <p className="map-popup-title">{labelPorTipo(r.tipo)}: {r.title}</p>
              <p className="map-popup-desc">{r.description}</p>
              <small className="map-popup-meta">
                {r.status} — {new Date(r.created_at).toLocaleString()}
              </small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}