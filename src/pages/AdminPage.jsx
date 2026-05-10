import { useState, useEffect } from 'react'
import { getAllUsers } from '../api/user.api'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando brigadistas...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div style={{ padding: '16px' }}>
      <h1>Panel Admin</h1>
      <h2>Brigadistas registrados ({users.length})</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#cc2200', color: 'white' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Rol</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Registro</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
              <td style={{ padding: '10px' }}>{u.id}</td>
              <td style={{ padding: '10px' }}>{u.email}</td>
              <td style={{ padding: '10px' }}>{u.name || '—'}</td>
              <td style={{ padding: '10px' }}>
                <span style={{
                  backgroundColor: u.role === 'admin' ? '#cc2200' : '#333',
                  color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px'
                }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: '10px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}