//Create and getall

import { apiFetch } from "./client";

export const getReports = () =>
    apiFetch('/api/reports')

export const createReports = (tittle, description, lat, lng) =>
    apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({tittle, description, lat, lng}),

    })