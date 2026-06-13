//profile, update, users

import { apiFetch } from "./client";

export const getProfile = () =>
    apiFetch('/api/users/profile')


export const updateProfile = ( email,name) =>
    apiFetch('/api/users/update' ,{
        method: 'PUT',
        body: JSON.stringify({email, name}),
    })

export const getAllUsers = () =>
    apiFetch('/api/users/users')

export const updateUserAdmin = (id, { brigade_id, estado }) =>
    apiFetch(`/api/users/users/${id}/admin`, {
        method: 'PUT',
        body: JSON.stringify({ brigade_id, estado }),
    })

    // ─── BRIGADES ─────────────────────────────────────────
 
export const getBrigadas = () =>
    apiFetch('/api/users/brigadas')
 
export const createBrigada = (nombre, dominio, zona) =>
    apiFetch('/api/users/brigadas', {
        method: 'POST',
        body: JSON.stringify({ nombre, dominio, zona }),
    })
 
export const updateBrigada = (id, data) =>
    apiFetch(`/api/users/brigadas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
 
// ─── BRIGADE RESPONSES ────────────────────────────────
 
export const brigadeRespond = (report_id, estado = 'EN_CAMINO') =>
    apiFetch('/api/users/brigadas/respond', {
        method: 'POST',
        body: JSON.stringify({ report_id, estado }),
    })
 
export const updateBrigadeLocation = (report_id, lat, lng) =>
    apiFetch('/api/users/brigadas/location', {
        method: 'PUT',
        body: JSON.stringify({ report_id, lat, lng }),
    })
 
export const getActiveBrigades = () =>
    apiFetch('/api/users/brigadas/active')
 