//Registro y login 

import { apiFetch } from "./client";

export const registerUser = (email, password) =>
    apiFetch('/api/auth/register',{
        method: 'POST',
        body: JSON.stringify({email, password}),
    })
export const loginUser = (email, password) =>
    apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({email, password}),
    })

