import { apiFetch } from "./client"

export const getReports = () =>
  apiFetch('/api/reports')

export const createReport = (title, description, lat, lng, tipo = 'INCENDIO') =>
  apiFetch('/api/reports', {
    method: 'POST',
    body: JSON.stringify({ title, description, lat, lng, tipo }),
  })