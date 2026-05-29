import { useState, useEffect } from 'react'
import { getAllUsers, getBrigadas } from '../api/user.api'
import { getReports } from '../api/report.api'
import { apiFetch } from '../api/client'
import '../styles/pages/AdminHomePage.css'

const TIPO_COLORS = { INCENDIO: '#E24B4A', FOCO: '#EF9F27', HUMO: '#888780' }
const TIPO_ICON   = { INCENDIO: 'ti-flame', FOCO: 'ti-alert-triangle', HUMO: 'ti-cloud' }

function StatCard({ value, label, dotColor, pulse = false }) {
  return (
    <div className="adminhome-stat-card">
      <p className="adminhome-stat-label">{label}</p>
      <p className="adminhome-stat-value">{value}</p>
      <span className={`adminhome-stat-dot ${pulse ? 'adminhome-pulse' : ''}`} style={{ background: dotColor }} />
    </div>
  )
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="adminhome-chart">
      {data.map(d => (
        <div key={d.tipo} className="adminhome-chart-bar-group">
          <div className="adminhome-chart-bar-wrap">
            <div
              className="adminhome-chart-bar"
              style={{ height: `${Math.max((d.count / max) * 100, 4)}px`, background: TIPO_COLORS[d.tipo] }}
            />
          </div>
          <span className="adminhome-chart-label">
            <i className={`ti ${TIPO_ICON[d.tipo]}`} aria-hidden="true" /> {d.tipo.toLowerCase()}
          </span>
          <span className="adminhome-chart-count">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

const STATUS_CONFIG = {
  ACTIVE:     { cls: 'sbadge-active',      fill: '#E24B4A' },
  CONTROLLED: { cls: 'sbadge-controlled',  fill: '#EF9F27' },
  REVIEWED:   { cls: 'sbadge-reviewed',    fill: '#639922' },
  DISMISSED:  { cls: 'sbadge-dismissed',   fill: '#888780' },
}

export default function AdminHomePage() {
  const [reports, setReports]   = useState([])
  const [users, setUsers]       = useState([])
  const [brigadas, setBrigadas] = useState([])
  const [alerts, setAlerts]     = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      const [r, u, b, a] = await Promise.allSettled([
        getReports(),
        getAllUsers(),
        getBrigadas(),
        apiFetch('/api/notifications/admin/alerts'),
      ])
      if (r.status === 'fulfilled') setReports(Array.isArray(r.value) ? r.value : [])
      if (u.status === 'fulfilled') setUsers(Array.isArray(u.value) ? u.value : [])
      if (b.status === 'fulfilled') setBrigadas(Array.isArray(b.value) ? b.value : [])
      if (a.status === 'fulfilled') setAlerts(Array.isArray(a.value) ? a.value : [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="adminhome-container"><p className="adminhome-loading">Loading...</p></div>

  const activeReports  = reports.filter(r => r.status === 'ACTIVE').length
  const pendingAlerts  = alerts.filter(a => a.status === 'PENDING').length
  const activeBrigadas = brigadas.filter(b => b.activa).length
  const pendingUsers   = users.filter(u => u.estado === 'PENDING').length
  const total          = reports.length || 1

  const tipoData     = ['INCENDIO', 'FOCO', 'HUMO'].map(tipo => ({
    tipo, count: reports.filter(r => r.tipo === tipo).length,
  }))

  const statusData   = Object.keys(STATUS_CONFIG).map(s => ({
    status: s, count: reports.filter(r => r.status === s).length,
  }))

  return (
    <div className="adminhome-container">
      <p className="adminhome-page-title">
        <i className="ti ti-dashboard" aria-hidden="true" /> Admin overview
      </p>

      {activeReports > 0 && (
        <div className="adminhome-emergency-banner">
          <span className="adminhome-pulse-dot" />
          {activeReports} active fire{activeReports > 1 ? 's' : ''} requiring attention
        </div>
      )}

      <div className="adminhome-stats">
        <StatCard value={reports.length}  label="Total reports"    dotColor="#888780" />
        <StatCard value={activeReports}   label="Active fires"     dotColor="#E24B4A" pulse={activeReports > 0} />
        <StatCard value={pendingAlerts}   label="Pending alerts"   dotColor="#EF9F27" pulse={pendingAlerts > 0} />
        <StatCard value={activeBrigadas}  label="Active brigades"  dotColor="#639922" />
        <StatCard value={users.length}    label="Users"            dotColor="#888780" />
        <StatCard value={pendingUsers}    label="Pending approval" dotColor="#EF9F27" pulse={pendingUsers > 0} />
      </div>

      <div className="adminhome-row">
        <div className="adminhome-panel">
          <p className="adminhome-panel-title">Reports by type</p>
          <BarChart data={tipoData} />
        </div>
        <div className="adminhome-panel">
          <p className="adminhome-panel-title">Reports by status</p>
          <div className="adminhome-status-list">
            {statusData.map(({ status, count }) => {
              const { cls, fill } = STATUS_CONFIG[status]
              return (
                <div key={status} className="adminhome-status-row">
                  <span className={`adminhome-sbadge ${cls}`}>{status.toLowerCase()}</span>
                  <div className="adminhome-bar-track">
                    <div className="adminhome-bar-fill" style={{ width: `${Math.round((count / total) * 100)}%`, background: fill }} />
                  </div>
                  <span className="adminhome-scount">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="adminhome-panel adminhome-panel--mt">
        <p className="adminhome-panel-title">Recent reports</p>
        <div className="adminhome-table-wrapper">
          <table className="adminhome-table">
            <thead>
              <tr>
                <th>Type</th><th>Title</th><th>Location</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 5).map(r => {
                const { cls } = STATUS_CONFIG[r.status] || {}
                return (
                  <tr key={r.id}>
                    <td>
                      <i className={`ti ${TIPO_ICON[r.tipo]}`} style={{ color: TIPO_COLORS[r.tipo], fontSize: 15, verticalAlign: -2 }} aria-hidden="true" />
                      {' '}{r.tipo.toLowerCase()}
                    </td>
                    <td>{r.title}</td>
                    <td className="adminhome-muted">{parseFloat(r.lat).toFixed(3)}, {parseFloat(r.lng).toFixed(3)}</td>
                    <td><span className={`adminhome-sbadge ${cls}`}>{r.status?.toLowerCase()}</span></td>
                    <td className="adminhome-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="adminhome-panel adminhome-panel--mt">
        <p className="adminhome-panel-title">Brigades</p>
        <div className="adminhome-brigades">
          {brigadas.map(b => (
            <div key={b.id} className={`adminhome-bchip ${!b.activa ? 'adminhome-bchip--inactive' : ''}`}>
              <span className="adminhome-bchip-name">
                <i className="ti ti-truck" style={{ fontSize: 13, verticalAlign: -1 }} aria-hidden="true" /> {b.nombre}
              </span>
              <span className="adminhome-bchip-meta">
                {b.zona || '—'} · {b.total_miembros} members{!b.activa ? ' · inactive' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}