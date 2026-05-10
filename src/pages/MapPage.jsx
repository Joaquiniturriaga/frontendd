import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useReports } from '../hooks/useReports'

const centro = [-34.1703, -70.7431]

const iconoPorTipo = (tipo) => {
  const emoji = tipo === 'INCENDIO' ? '🔥' : tipo === 'FOCO' ? '⚠️' : '💨'
  return L.divIcon({
    html: `<div style="font-size:28px;line-height:1">${emoji}</div>`,
    className: '',
    iconAnchor: [14, 14],
  })
}

export default function MapPage() {
  const { reports, loading } = useReports()

  return (
    <div style={{ height: 'calc(100vh - 60px)', width: '100%' }}>
      {loading && <p style={{ position: 'absolute', zIndex: 999, padding: '8px' }}>Cargando reportes...</p>}
      <MapContainer
        center={centro}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {reports.map(r => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={iconoPorTipo(r.tipo)}>
            <Popup>
              <strong>{r.tipo === 'INCENDIO' ? '🔥' : r.tipo === 'FOCO' ? '⚠️' : '💨'} {r.title}</strong>
              <p>{r.description}</p>
              <small>{r.status} — {new Date(r.created_at).toLocaleString()}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}