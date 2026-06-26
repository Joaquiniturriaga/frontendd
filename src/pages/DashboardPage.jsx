import { useState, useMemo } from 'react'
import { useReports } from '../hooks/useReports'
import { useLocation } from '../hooks/useLocation'
import '../styles/pages/DashboardPage.css'
import { haversineKm } from '../utils/geo'
import { timeAgo, formatDuration } from '../utils/time'
import {
  IconFlame,
  IconCar,
  IconMountain,
  IconDroplet,
  IconAlertTriangle,
  IconWind,
  IconCalendar,
  IconCheck,
} from '@tabler/icons-react'


const TIPO_CONFIG = {
  INCENDIO:   { icon: IconFlame,         label: 'Incendio',   badgeCls: 'badge-incendio'   },
  ACCIDENTE:  { icon: IconCar,           label: 'Accidente',  badgeCls: 'badge-accidente'  },
  DERRUMBE:   { icon: IconMountain,      label: 'Derrumbe',   badgeCls: 'badge-derrumbe'   },
  INUNDACION: { icon: IconDroplet,       label: 'Inundación', badgeCls: 'badge-inundacion' },
  FOCO:       { icon: IconAlertTriangle, label: 'Foco',       badgeCls: 'badge-foco'       },
  HUMO:       { icon: IconWind,          label: 'Humo',       badgeCls: 'badge-humo'       },
}

const STATUS_CONFIG = {
  ACTIVE:     { label: 'Active',     dotCls: 'dot-active',     pillCls: 'pill-active',     pulse: true  },
  CONTROLLED: { label: 'Controlled', dotCls: 'dot-controlled', pillCls: 'pill-controlled', pulse: false },
  REVIEWED:   { label: 'Reviewed',   dotCls: 'dot-reviewed',   pillCls: 'pill-reviewed',   pulse: false },
  DISMISSED:  { label: 'Dismissed',  dotCls: 'dot-dismissed',  pillCls: 'pill-dismissed',  pulse: false },
}

const FILTERS = [
  { key: 'ALL',        label: 'All',        icon: null              },
  { key: 'INCENDIO',   label: 'Incendio',   icon: IconFlame         },
  { key: 'ACCIDENTE',  label: 'Accidente',  icon: IconCar           },
  { key: 'DERRUMBE',   label: 'Derrumbe',   icon: IconMountain      },
  { key: 'INUNDACION', label: 'Inundación', icon: IconDroplet       },
  { key: 'ACTIVE',     label: 'Active',     icon: null              },
  { key: 'Controlled', label: 'Controlled', icon: null              },
]
const PAGE_SIZE = 20


const toInputDate = (d) => d.toISOString().split('T')[0]

export default function DashboardPage() {
  const { reports, loading, error } = useReports()
  const { userLocation } = useLocation()

  const [selected, setSelected]   = useState(null)
  const [filter, setFilter]       = useState('ALL')
  const [page, setPage]           = useState(1)
  const [dateFrom, setDateFrom]   = useState('')
  const [dateTo, setDateTo]       = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)

  const filtered = useMemo(() => {
    let result = reports

    if (filter !== 'ALL') {
      if (['INCENDIO','FOCO','HUMO'].includes(filter))
        result = result.filter(r => r.tipo === filter)
      else
        result = result.filter(r => r.status === filter)
    }

    if (dateFrom)
      result = result.filter(r => new Date(r.created_at) >= new Date(dateFrom))
    if (dateTo)
      result = result.filter(r => new Date(r.created_at) <= new Date(dateTo + 'T23:59:59'))

    return result
  }, [reports, filter, dateFrom, dateTo])

  const paginated  = filtered.slice(0, page * PAGE_SIZE)
  const hasMore    = paginated.length < filtered.length

  const selectedReport = reports.find(r => r.id === selected)
  const distKm = selectedReport && userLocation
    ? haversineKm(userLocation.lat, userLocation.lng, selectedReport.lat, selectedReport.lng)
    : null

  const clearDates = () => { setDateFrom(''); setDateTo(''); setShowDateFilter(false) }
  const hasDateFilter = dateFrom || dateTo

  return (
    <div className="db-layout" style={{ gridTemplateColumns: selectedReport ? undefined : '1fr' }}>

      {/* ── LIST PANEL ─────────────────────────── */}
      <div className="db-list">
        <div className="db-list-header">
          <span className="db-list-title">Active reports</span>
          <div className="db-list-header-right">
            <button
              className={`db-date-toggle ${hasDateFilter ? 'db-date-toggle--active' : ''}`}
              onClick={() => setShowDateFilter(v => !v)}
              title="Filter by date"
            >
              <IconCalendar size={16} />
              {hasDateFilter && <IconCheck size={14} />}
            </button>
            <span className="db-list-count">{filtered.length} report{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {showDateFilter && (
          <div className="db-date-filter">
            <div className="db-date-inputs">
              <div className="db-date-field">
                <label className="db-date-label">From</label>
                <input
                  type="date"
                  className="db-date-input"
                  value={dateFrom}
                  max={dateTo || toInputDate(new Date())}
                  onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                />
              </div>
              <div className="db-date-field">
                <label className="db-date-label">To</label>
                <input
                  type="date"
                  className="db-date-input"
                  value={dateTo}
                  min={dateFrom}
                  max={toInputDate(new Date())}
                  onChange={e => { setDateTo(e.target.value); setPage(1) }}
                />
              </div>
            </div>
            {hasDateFilter && (
              <button className="db-date-clear" onClick={clearDates}>Clear dates</button>
            )}
          </div>
        )}

        <div className="db-filters">
          {FILTERS.map(f => {
            const FilterIcon = f.icon
            return (
              <button
                key={f.key}
                className={`db-filter-chip ${filter === f.key ? 'active' : ''}`}
                onClick={() => { setFilter(f.key); setPage(1); setSelected(null) }}
              >
                {FilterIcon && <FilterIcon size={14} />}
                {f.label}
              </button>
            )
          })}
        </div>

        {loading && <p className="db-state-msg">Loading reports...</p>}
        {error   && <p className="db-state-msg db-state-msg--error">{error}</p>}
        {!loading && filtered.length === 0 && (
          <p className="db-state-msg">No reports match this filter.</p>
        )}

        {paginated.map(r => {
          const tipo = TIPO_CONFIG[r.tipo] ?? TIPO_CONFIG.INCENDIO
          const TipoIcon = tipo.icon
          const status = STATUS_CONFIG[r.status] || STATUS_CONFIG.ACTIVE
          const dist   = userLocation
            ? haversineKm(userLocation.lat, userLocation.lng, r.lat, r.lng)
            : null

          return (
            <div
              key={r.id}
              className={`db-card ${selected === r.id ? 'db-card--selected' : ''}`}
              onClick={() => setSelected(r.id)}
            >
              <div className={`db-card-icon ${tipo.badgeCls}`}>
                <TipoIcon size={20} />
              </div>
              <div className="db-card-info">
                <p className="db-card-title">{r.title}</p>
                <div className="db-card-meta">
                  <span className={`db-dot ${status.dotCls} ${status.pulse ? 'db-dot--pulse' : ''}`} />
                  <span>{status.label}</span>
                  {dist !== null && <><span>·</span><span>{dist.toFixed(1)} km</span></>}
                </div>
              </div>
              <span className="db-card-time">{timeAgo(r.created_at)}</span>
            </div>
          )
        })}

        {hasMore && (
          <button className="db-show-more" onClick={() => setPage(p => p + 1)}>
            Show more · {filtered.length - paginated.length} remaining
          </button>
        )}
      </div>

      {/* ── DETAIL PANEL ───────────────────────── */}
      {selectedReport && (() => {
        const tipo   = TIPO_CONFIG[selectedReport.tipo]    || TIPO_CONFIG.INCENDIO
        const TipoIcon = tipo.icon
        const status = STATUS_CONFIG[selectedReport.status] || STATUS_CONFIG.ACTIVE
        const duration = Math.floor((Date.now() - new Date(selectedReport.created_at).getTime()) / 60000)
        const durationStr = duration < 60
          ? `${duration} min`
          : duration < 1440
          ? `${Math.floor(duration/60)}h ${duration%60}m`
          : `${Math.floor(duration/1440)}d`

        return (
          <div className="db-detail">
            <div className="db-detail-header">
              <div className="db-detail-type-row">
                <div className={`db-detail-icon ${tipo.badgeCls}`}>
                  <TipoIcon size={22} />
                </div>
                <div>
                  <p className="db-detail-title">{selectedReport.title}</p>
                  <p className="db-detail-subtitle">{tipo.label} · reported {timeAgo(selectedReport.created_at)}</p>
                </div>
              </div>
              <div className="db-detail-header-right">
                <span className={`db-status-pill ${status.pillCls}`}>
                  <span className={`db-dot ${status.dotCls} ${status.pulse ? 'db-dot--pulse' : ''}`} />
                  {status.label}
                </span>
                <button className="db-detail-close" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>

            <div className="db-detail-body">
              <div>
                <p className="db-detail-section">Overview</p>
                <div className="db-stats-grid">
                  <div className="db-stat">
                    <p className="db-stat-value">{distKm !== null ? `${distKm.toFixed(1)} km` : '—'}</p>
                    <p className="db-stat-label">Distance from you</p>
                  </div>
                  <div className="db-stat">
                    <p className="db-stat-value">{durationStr}</p>
                    <p className="db-stat-label">Active for</p>
                  </div>
                  <div className="db-stat">
                    <p className="db-stat-value">{parseFloat(selectedReport.lat).toFixed(4)}</p>
                    <p className="db-stat-label">Latitude</p>
                  </div>
                  <div className="db-stat">
                    <p className="db-stat-value">{parseFloat(selectedReport.lng).toFixed(4)}</p>
                    <p className="db-stat-label">Longitude</p>
                  </div>
                </div>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="db-detail-section">Description</p>
                  <p className="db-detail-desc">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <p className="db-detail-section">Timeline</p>
                <div className="db-timeline">
                  <div className="db-tl-item">
                    <div className="db-tl-dot-wrap">
                      <div className="db-tl-dot db-tl-dot-created" />
                      <div className="db-tl-line" />
                    </div>
                    <div>
                      <p className="db-tl-text">Report created</p>
                      <p className="db-tl-time">{new Date(selectedReport.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedReport.status !== 'ACTIVE' && (
                    <div className="db-tl-item">
                      <div className="db-tl-dot-wrap">
                        <div className="db-tl-dot db-tl-dot-changed" />
                      </div>
                      <div>
                        <p className="db-tl-text">Status changed to {selectedReport.status.toLowerCase()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}