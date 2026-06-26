import { useState, useRef, useEffect } from "react";
import { useAgent } from "../../hooks/useAgent.js";
import '../../styles/components/agent/FireAgentPanel.css'
// ─── Iconos de Tabler ────────────────────────────────────────────────────────
import {
  IconFlame,
  IconX,
  IconThermometer,
  IconTruck,
  IconFileText,
  IconMapPin,
  IconChartBar,
  IconMessageChatbot,
  IconSparkles,
  IconSend,
  IconRefresh,
  IconAlertCircle,
  IconUsers,
  IconRadio,
  IconBell,
  IconLoader2,
  IconCloud,
  IconWind,
  IconDroplet,
  IconCheck,
  IconExclamationCircle,
} from "@tabler/icons-react";

// ─── Constantes ───────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: "Riesgo",    text: "¿Cuál es el riesgo de incendio en San Fernando hoy?", icon: IconThermometer },
  { label: "Brigadas",  text: "¿Qué brigadas están disponibles?", icon: IconUsers },
  { label: "Reportes",  text: "¿Hay reportes activos en este momento?", icon: IconFileText },
  { label: "Unidades",  text: "¿Hay unidades en campo?", icon: IconTruck },
  { label: "Situación", text: "Análisis completo de situación", icon: IconChartBar },
];

const TABS = [
  { id: "chat",    label: "Agente", icon: IconMessageChatbot },
  { id: "metrics", label: "Métricas", icon: IconChartBar },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function RiskBadge({ level }) {
  if (!level) return null;
  return (
    <span
      className="fap-risk-badge"
      style={{ backgroundColor: RISK_COLOR[level] ?? "#64748b" }}
    >
      {level}
    </span>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`fap-msg fap-msg--${isUser ? "user" : "bot"}`}>
      {!isUser && (
        <div className="fap-msg__avatar">
          <IconSparkles size={20} stroke={1.5} />
        </div>
      )}
      <div className="fap-msg__bubble">
        <p className="fap-msg__text">{msg.content}</p>
        {!isUser && <RiskBadge level={msg.risk} />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="fap-msg fap-msg--bot">
      <div className="fap-msg__avatar">
        <IconSparkles size={20} stroke={1.5} />
      </div>
      <div className="fap-typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color, icon: Icon }) {
  return (
    <div className="fap-metric-card">
      <div className="fap-metric-card__label">
        {Icon && <Icon size={18} stroke={1.5} style={{ marginRight: 6 }} />}
        {title}
      </div>
      <div className="fap-metric-card__value" style={{ color }}>
        {value}
      </div>
      {subtitle && <div className="fap-metric-card__sub">{subtitle}</div>}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FireAgentPanel() {
  const [open, setOpen] = useState(false);

  const {
    messages, input, setInput, loading, error, sendMessage,
    metrics, metricsLoading, metricsError, loadMetrics,
    activeTab, setActiveTab,
  } = useAgent();

  const messagesEndRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (open && activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, activeTab]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clima helper para el subtitle
  const climaSubtitle = metrics
    ? [
        metrics.clima?.temperatura != null && `${metrics.clima.temperatura}°C`,
        metrics.clima?.humedad     != null && `${metrics.clima.humedad}% HR`,
        metrics.clima?.viento      != null && `${metrics.clima.viento} km/h`,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <>
      {/* ── Botón flotante FAB ── */}
      <button
        className={`fap-fab ${open ? "fap-fab--active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Agente Valle del Sol"
        title="Agente Valle del Sol"
      >
        {open ? <IconX size={24} stroke={2} /> : <IconFlame size={24} stroke={2} />}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div className="fap-panel" role="dialog" aria-label="Agente Valle del Sol">

          {/* Header + Tabs */}
          <div className="fap-header">
            <div className="fap-header__title">
              <IconFlame size={22} stroke={1.5} style={{ marginRight: 8 }} /> 
              Agente Valle del Sol
            </div>
            <div className="fap-tabs" role="tablist">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={activeTab === id}
                  className={`fap-tab ${activeTab === id ? "fap-tab--active" : ""}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon size={18} stroke={1.5} style={{ marginRight: 6 }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ──────────────── TAB: CHAT ──────────────── */}
          {activeTab === "chat" && (
            <div className="fap-chat">
              {/* Mensajes */}
              <div className="fap-chat__messages" role="log" aria-live="polite">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} msg={msg} />
                ))}
                {loading && <TypingIndicator />}
                {error && (
                  <div className="fap-alert fap-alert--error">
                    <IconAlertCircle size={18} stroke={1.5} style={{ marginRight: 8 }} />
                    {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              <div className="fap-quick">
                {QUICK_PROMPTS.map(({ label, text, icon: Icon }) => (
                  <button
                    key={label}
                    className="fap-quick__btn"
                    onClick={() => sendMessage(text)}
                    disabled={loading}
                  >
                    <Icon size={16} stroke={1.5} style={{ marginRight: 4 }} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="fap-input-row">
                <textarea
                  className="fap-textarea"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu consulta… (Enter para enviar)"
                  rows={2}
                  disabled={loading}
                  aria-label="Mensaje al agente"
                />
                <button
                  className="fap-send-btn"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  aria-label="Enviar mensaje"
                >
                  <IconSend size={20} stroke={2} />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────── TAB: MÉTRICAS ──────────────── */}
          {activeTab === "metrics" && (
            <div className="fap-metrics">

              {/* Loading */}
              {metricsLoading && (
                <div className="fap-metrics__loading">
                  <IconLoader2 size={28} stroke={1.5} className="fap-spinner" />
                  <span>Cargando métricas…</span>
                </div>
              )}

              {/* Error métricas */}
              {metricsError && !metricsLoading && (
                <div className="fap-alert fap-alert--error">
                  <IconAlertCircle size={18} stroke={1.5} style={{ marginRight: 8 }} />
                  {metricsError}
                </div>
              )}

              {/* Datos */}
              {metrics && !metricsLoading && (
                <>
                  {/* Grid de cards */}
                  <div className="fap-metrics__grid">
                    <MetricCard
                      title="Riesgo Climático"
                      value={metrics.clima?.nivel_riesgo ?? "—"}
                      subtitle={climaSubtitle}
                      color={RISK_COLOR[metrics.clima?.nivel_riesgo] ?? "#94a3b8"}
                      icon={IconCloud}
                    />
                    <MetricCard
                      title="Brigadas"
                      value={`${metrics.brigadas?.activas ?? 0} / ${metrics.brigadas?.total ?? 0}`}
                      subtitle="activas / total"
                      color="#60a5fa"
                      icon={IconUsers}
                    />
                    <MetricCard
                      title="Reportes"
                      value={`${metrics.reportes?.activos ?? 0} / ${metrics.reportes?.total ?? 0}`}
                      subtitle="activos / total"
                      color="#f97316"
                      icon={IconFileText}
                    />
                    <MetricCard
                      title="En Campo"
                      value={metrics.unidades_desplegadas?.total ?? 0}
                      subtitle="unidades desplegadas"
                      color="#a78bfa"
                      icon={IconTruck}
                    />
                    <MetricCard
                      title="Alertas"
                      value={metrics.alertas?.pendientes ?? 0}
                      subtitle={`de ${metrics.alertas?.total ?? 0} totales`}
                      color={metrics.alertas?.pendientes > 0 ? "#dc2626" : "#22c55e"}
                      icon={IconBell}
                    />
                  </div>

                  {/* Últimos reportes activos */}
                  {(metrics.reportes?.ultimos_activos?.length ?? 0) > 0 && (
                    <div className="fap-report-list">
                      <div className="fap-report-list__title">
                        <IconFileText size={18} stroke={1.5} style={{ marginRight: 8 }} />
                        Reportes activos recientes
                      </div>
                      {metrics.reportes.ultimos_activos.map((r) => (
                        <div key={r.id} className="fap-report-item">
                          <span className="fap-report-item__tipo">{r.tipo}</span>
                          <span className="fap-report-item__titulo">{r.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="fap-metrics__footer">
                    <span className="fap-metrics__zona">
                      <IconMapPin size={16} stroke={1.5} style={{ marginRight: 4 }} />
                      {metrics.zona_referencia}
                    </span>
                    <button
                      className="fap-refresh-btn"
                      onClick={loadMetrics}
                      disabled={metricsLoading}
                    >
                      <IconRefresh size={18} stroke={1.5} style={{ marginRight: 6 }} />
                      Actualizar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      )}
    </>
  );
}