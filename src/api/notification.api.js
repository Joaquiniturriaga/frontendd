// src/api/notification.api.js
import { apiFetch } from './client'

export const updateMyLocation = (lat, lng) =>
  apiFetch('/api/notifications/location', {
    method: 'POST',
    body: JSON.stringify({ lat, lng }),
  })

export const getMyAlerts = () =>
  apiFetch('/api/notifications/location/my')

export const getAdminAlerts = () =>
  apiFetch('/api/notifications/admin/alerts')

export const reviewAlert = (id, status) =>
  apiFetch(`/api/notifications/admin/alerts/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })