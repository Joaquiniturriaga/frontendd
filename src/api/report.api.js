//Create and getall

import { apiFetch } from "./client";


export const getReports = () =>
    apiFetch('/api/reports')

export const createReport = (title, description, lat, lng) =>
    apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({title, description, lat, lng}),

    })