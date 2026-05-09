//profile, update, users

import { apiFetch } from "./client";

export const getProfile = () =>
    apiFetch('/api/users/profile')


export const updateProfile = ( email,name) =>
    apiFetch('/api/users/update' ,{
        method: 'PUT',
        body: JSON.stringify({email, name}),
    }),

export const getAllUsers = () =>
    apiFetch('/api/users/users')