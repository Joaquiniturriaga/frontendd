import { apiFetch } from "./client.js";

export const sendChatMessage = (message, history = []) =>
  apiFetch("/api/agent/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      history: history.slice(-20),
    }),
  });

export const getMetricsSummary = () =>
  apiFetch("/api/agent/metrics/summary");