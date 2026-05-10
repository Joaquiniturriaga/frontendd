import { useState } from "react";
import { useReports } from "../hooks/useReports";

export default function DashboardPage() {
  const { reports, loading, error, addReport } = useReports()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [submitting, setSubmitting] = useState(false)

   const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addReport(title, description, parseFloat(lat), parseFloat(lng))
      setTitle('')
      setDescription('')
      setLat('')
      setLng('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1>Dashboard — Reports</h1>

      <h2>Crear reporte</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Tittle"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          placeholder="Latitude (ej: -33.4569)"
          value={lat}
          onChange={e => setLat(e.target.value)}
          required
        />
        <input
          placeholder="Length (ej: -70.6483)"
          value={lng}
          onChange={e => setLng(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Create report'}
        </button>
      </form>

      <h2> active reports</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {reports.map(r => (
        <div key={r.id} style={{ border: '1px solid #ccc', margin: '8px', padding: '8px' }}>
          <strong>{r.title}</strong>
          <p>{r.description}</p>
          <small>📍 {r.lat}, {r.lng} — {r.status}</small>
        </div>
      ))}
    </div>
  )
}