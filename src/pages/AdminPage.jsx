import { useState, useEffect } from 'react'
import { getAllUsers, updateUserAdmin, getBrigadas, createBrigada, updateBrigada } from '../api/user.api'
import { apiFetch } from '../api/client'
import '../styles/pages/AdminPage.css'

const STATUS_LABELS = {
  PENDING:    { label: 'Pending',    cls: 'pending'    },
  CONTROLLED: { label: 'Controlled', cls: 'controlled' },
  REVIEWED:   { label: 'Reviewed',   cls: 'reviewed'   },
  DISMISSED:  { label: 'Dismissed',  cls: 'dismissed'  },
}

const USER_ESTADOS = ['ACTIVE', 'INACTIVE', 'SUSPENDED']

export default function AdminPage() {
  const [tab, setTab] = useState('alerts')

  const [alerts, setAlerts]               = useState([])
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [alertsError, setAlertsError]     = useState(null)

  const [users, setUsers]               = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError]     = useState(null)
  const [editingUser, setEditingUser]   = useState(null)
  const [userForm, setUserForm]         = useState({ brigade_id: '', estado: '' })

  const [brigadas, setBrigadas]                   = useState([])
  const [brigadasLoading, setBrigadasLoading]     = useState(true)
  const [brigadasError, setBrigadasError]         = useState(null)
  const [showBrigadaForm, setShowBrigadaForm]     = useState(false)
  const [brigadeForm, setBrigadeForm]             = useState({ nombre: '', dominio: '', zona: '' })
  const [brigadeSubmitting, setBrigadeSubmitting] = useState(false)
  const [brigadeFormError, setBrigadeFormError]   = useState(null)

  useEffect(() => {
    apiFetch('/api/notifications/admin/alerts')
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .catch(err => setAlertsError(err.message))
      .finally(() => setAlertsLoading(false))

    getAllUsers()
      .then(setUsers)
      .catch(err => setUsersError(err.message))
      .finally(() => setUsersLoading(false))

    getBrigadas()
      .then(data => setBrigadas(Array.isArray(data) ? data : []))
      .catch(err => setBrigadasError(err.message))
      .finally(() => setBrigadasLoading(false))
  }, [])

  const updateAlertStatus = async (id, status) => {
    try {
      const updated = await apiFetch(`/api/notifications/admin/alerts/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: updated.status ?? status } : a))
    } catch (err) {
      console.error('Error updating alert:', err.message)
    }
  }

  const openUserEdit = (u) => {
    setEditingUser(u.id)
    setUserForm({ brigade_id: u.brigade_id ?? '', estado: u.estado ?? 'ACTIVE' })
  }

  const saveUserAdmin = async (id) => {
    try {
      const updated = await updateUserAdmin(id, {
        brigade_id: userForm.brigade_id ? parseInt(userForm.brigade_id) : null,
        estado: userForm.estado,
      })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u))
      setEditingUser(null)
    } catch (err) {
      console.error('Error updating user:', err.message)
    }
  }

  const handleCreateBrigada = async (e) => {
    e.preventDefault()
    if (!brigadeForm.nombre.trim()) { setBrigadeFormError('Name is required'); return }
    setBrigadeSubmitting(true)
    setBrigadeFormError(null)
    try {
      const nueva = await createBrigada(brigadeForm.nombre, brigadeForm.dominio, brigadeForm.zona)
      setBrigadas(prev => [...prev, nueva])
      setBrigadeForm({ nombre: '', dominio: '', zona: '' })
      setShowBrigadaForm(false)
    } catch (err) {
      setBrigadeFormError(err.message)
    } finally {
      setBrigadeSubmitting(false)
    }
  }

  const toggleBrigadaActiva = async (b) => {
    try {
      const updated = await updateBrigada(b.id, { activa: !b.activa })
      setBrigadas(prev => prev.map(x => x.id === b.id ? { ...x, activa: updated.activa } : x))
    } catch (err) {
      console.error('Error toggling brigade:', err.message)
    }
  }

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>
          Alerts {alerts.length > 0 && <span className="admin-tab-count">{alerts.length}</span>}
        </button>
        <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          Brigadistas
        </button>
        <button className={`admin-tab ${tab === 'brigadas' ? 'active' : ''}`} onClick={() => setTab('brigadas')}>
          Brigades {brigadas.length > 0 && <span className="admin-tab-count">{brigadas.length}</span>}
        </button>
      </div>

      {tab === 'alerts' && (
        <div className="admin-section">
          {alertsLoading && <p className="admin-loading">Loading alerts...</p>}
          {alertsError && <p className="admin-error">{alertsError}</p>}
          {!alertsLoading && alerts.length === 0 && <p className="admin-empty">No alerts registered.</p>}
          <div className="admin-alerts-grid">
            {alerts.map(a => {
              const s = STATUS_LABELS[a.status] ?? { label: a.status, cls: 'pending' }
              return (
                <div key={a.id} className={`admin-alert-card admin-alert-card--${s.cls}`}>
                  <div className="admin-alert-header">
                    <strong className="admin-alert-title">{a.report_title}</strong>
                    <span className={`admin-badge admin-badge--${s.cls}`}>{s.label}</span>
                  </div>
                  <p className="admin-alert-coords">📍 {a.lat}, {a.lng}</p>
                  <p className="admin-alert-meta">
                    Notified: {a.notified_count} — {new Date(a.created_at).toLocaleString()}
                  </p>
                  {a.reviewed_at && (
                    <p className="admin-alert-meta">Reviewed: {new Date(a.reviewed_at).toLocaleString()}</p>
                  )}
                  <div className="admin-alert-actions">
                    {Object.keys(STATUS_LABELS).filter(k => k !== a.status).map(k => (
                      <button
                        key={k}
                        className={`admin-action-btn admin-action-btn--${STATUS_LABELS[k].cls}`}
                        onClick={() => updateAlertStatus(a.id, k)}
                      >
                        {STATUS_LABELS[k].label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-section">
          {usersLoading && <p className="admin-loading">Loading brigadistas...</p>}
          {usersError && <p className="admin-error">{usersError}</p>}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Brigade</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.name || '—'}</td>
                    <td><span className={`admin-badge admin-badge--${u.role}`}>{u.role}</span></td>
                    <td>{u.brigade_nombre || '—'}</td>
                    <td>
                      <span className={`admin-badge admin-badge--estado-${(u.estado || 'active').toLowerCase()}`}>
                        {u.estado || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      {editingUser === u.id ? (
                        <div className="admin-user-edit">
                          <select
                            value={userForm.brigade_id}
                            onChange={e => setUserForm(f => ({ ...f, brigade_id: e.target.value }))}
                            className="admin-user-select"
                          >
                            <option value="">No brigade</option>
                            {brigadas.map(b => (
                              <option key={b.id} value={b.id}>{b.nombre}</option>
                            ))}
                          </select>
                          <select
                            value={userForm.estado}
                            onChange={e => setUserForm(f => ({ ...f, estado: e.target.value }))}
                            className="admin-user-select"
                          >
                            {USER_ESTADOS.map(e => (
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                          <div className="admin-user-edit-actions">
                            <button className="admin-action-btn admin-action-btn--reviewed" onClick={() => saveUserAdmin(u.id)}>Save</button>
                            <button className="admin-action-btn admin-action-btn--dismissed" onClick={() => setEditingUser(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button className="admin-action-btn admin-action-btn--controlled" onClick={() => openUserEdit(u)}>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'brigadas' && (
        <div className="admin-section">
          {brigadasLoading && <p className="admin-loading">Loading brigades...</p>}
          {brigadasError && <p className="admin-error">{brigadasError}</p>}

          <div className="admin-brigades-header">
            <h2>Brigades ({brigadas.length})</h2>
            <button
              className="admin-create-btn"
              onClick={() => { setShowBrigadaForm(v => !v); setBrigadeFormError(null) }}
            >
              {showBrigadaForm ? 'Cancel' : '+ New Brigade'}
            </button>
          </div>

          {showBrigadaForm && (
            <form className="admin-brigade-form" onSubmit={handleCreateBrigada}>
              <input
                placeholder="Brigade name *"
                value={brigadeForm.nombre}
                onChange={e => setBrigadeForm(f => ({ ...f, nombre: e.target.value }))}
                className="admin-brigade-input"
                required
              />
              <input
                placeholder="Domain (e.g. @brigadasur.cl)"
                value={brigadeForm.dominio}
                onChange={e => setBrigadeForm(f => ({ ...f, dominio: e.target.value }))}
                className="admin-brigade-input"
              />
              <input
                placeholder="Zone (e.g. South)"
                value={brigadeForm.zona}
                onChange={e => setBrigadeForm(f => ({ ...f, zona: e.target.value }))}
                className="admin-brigade-input"
              />
              {brigadeFormError && <p className="admin-error" style={{ margin: 0 }}>{brigadeFormError}</p>}
              <button type="submit" className="admin-create-btn" disabled={brigadeSubmitting}>
                {brigadeSubmitting ? 'Creating...' : 'Create Brigade'}
              </button>
            </form>
          )}

          <div className="admin-brigades-grid">
            {brigadas.map(b => (
              <div key={b.id} className={`admin-brigade-card ${!b.activa ? 'admin-brigade-card--inactive' : ''}`}>
                <div className="admin-brigade-card-header">
                  <strong>{b.nombre}</strong>
                  <span className={`admin-badge ${b.activa ? 'admin-badge--reviewed' : 'admin-badge--dismissed'}`}>
                    {b.activa ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="admin-brigade-meta">📍 {b.zona || '—'}</p>
                <p className="admin-brigade-meta">✉️ {b.dominio || 'No domain'}</p>
                <p className="admin-brigade-meta">👥 {b.total_miembros} member{b.total_miembros !== 1 ? 's' : ''}</p>
                <button
                  className={`admin-action-btn ${b.activa ? 'admin-action-btn--dismissed' : 'admin-action-btn--reviewed'}`}
                  onClick={() => toggleBrigadaActiva(b)}
                >
                  {b.activa ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}