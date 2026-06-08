import { useState, useCallback, useRef, useEffect } from "react";
import { sendChatMessage, getMetricsSummary } from "../api/agent.api.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Detecta el nivel de riesgo en el texto de respuesta del agente */
const detectRisk = (text) => {
  if (!text) return null;
  const upper = text.toUpperCase();
  // Orden importa: EXTREMO antes de ALTO para evitar match parcial
  for (const level of ["EXTREMO", "ALTO", "MODERADO", "BAJO"]) {
    if (upper.includes(level)) return level;
  }
  return null;
};

const WELCOME_MSG = {
  id: 0,
  role: "assistant",
  content:
    "Hola, soy el agente de Valle del Sol 🔥\n" +
    "Puedo consultar riesgo climático, brigadas activas, reportes en curso y " +
    "unidades desplegadas. ¿En qué te ayudo?",
  risk: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAgent = () => {
  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages, setMessages]   = useState([WELCOME_MSG]);
  const [input,    setInput]      = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState(null);

  // ── Métricas state ──────────────────────────────────────────────────────────
  const [metrics,       setMetrics]       = useState(null);
  const [metricsLoading,setMetricsLoading]= useState(false);
  const [metricsError,  setMetricsError]  = useState(null);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("chat");

  // Historial fuera del estado para no provocar re-renders innecesarios
  const historyRef = useRef([]);

  // ── sendMessage ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (textOverride) => {
      const msg = (textOverride ?? input).trim();
      if (!msg || loading) return;

      const userMsg = { id: Date.now(), role: "user", content: msg };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const data = await sendChatMessage(msg, historyRef.current);
        const risk = detectRisk(data.response);

        const assistantMsg = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.response,
          risk,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Actualizar historial para contexto de la próxima llamada
        historyRef.current = [
          ...historyRef.current,
          { role: "user",      content: msg           },
          { role: "assistant", content: data.response },
        ].slice(-20); // 10 pares máximo
      } catch (err) {
        setError(
          err?.response?.data?.detail ??
            "Error al conectar con el agente. Intenta de nuevo."
        );
      } finally {
        setLoading(false);
      }
    },
    [input, loading]
  );

  // ── loadMetrics ─────────────────────────────────────────────────────────────
  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
    const data = await getMetricsSummary();
      setMetrics(data);
    } catch {
      setMetricsError("Error al cargar métricas. Verifica la conexión.");
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Carga métricas automáticamente al cambiar al tab de métricas
  useEffect(() => {
    if (activeTab === "metrics") loadMetrics();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Chat
    messages, input, setInput, loading, error, sendMessage,
    // Métricas
    metrics, metricsLoading, metricsError, loadMetrics,
    // UI
    activeTab, setActiveTab,
  };
};