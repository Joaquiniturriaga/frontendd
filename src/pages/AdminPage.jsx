import { useState, useEffect } from 'react'
import { getAllUsers } from '../api/user.api'
import '../styles/pages/AdminPage.css'

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

  if (loading) return <p className="admin-loading">Cargando brigadistas...</p>
  if (error) return <p className="admin-error">{error}</p>

  return (
    <div className="admin-container">
      <h1>Panel Admin</h1>
      <h2>Brigadistas registrados ({users.length})</h2>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.name || '—'}</td>
                <td>
                  <span className={`admin-badge admin-badge--${u.role}`}>
                    {u.role}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}