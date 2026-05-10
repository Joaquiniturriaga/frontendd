import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useReports } from '../hooks/useReports'

const centro = [-34.1703, -70.7431]

export default function MapPage() {
  const { reports, loading } = useReports()

  return (
    <div style={{ height: 'calc(100vh - 60px)', width: '100%' }}>
      {loading && <p style={{ position: 'absolute', zIndex: 999 }}>Cargando reportes...</p>}
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
          <Marker key={r.id} position={[r.lat, r.lng]}>
            <Popup>
              <strong>{r.title}</strong>
              <p>{r.description}</p>
              <small>{r.status} — {new Date(r.created_at).toLocaleString()}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}