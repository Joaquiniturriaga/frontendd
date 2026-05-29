import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../api/auth.api'
import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const { saveSession, clearSession, user } = useAuthContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await loginUser(email, password)
      // ← guardamos TODO el payload, no solo email+role
      const payload = JSON.parse(
        atob(data.token.replace('AUTH-', '').split('.')[1])
      )
      saveSession(data.token, {
        id:         payload.id,
        email:      payload.email,
        role:       payload.role,
        brigade_id: payload.brigade_id ?? null,
      })
      //mandamos a ruta si es admin
      navigate(payload.role === 'admin' ? '/admin/home' : '/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      await registerUser(email, password)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // un solo navigate, en el hook
  const logout = () => {
    clearSession()
    navigate('/login')
  }

  return { login, register, logout, user, loading, error }
}