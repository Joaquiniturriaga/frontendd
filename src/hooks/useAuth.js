//Desde aca consumimos authcontext

import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../api/auth.api'
import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const { saveSession, logout, user } = useAuthContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await loginUser(email, password)
      // data.token viene como "AUTH-eyJ..."
      // guardamos el token completo, client.js lo manda tal cual
      saveSession(data.token, { email })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const register = async( email, password) =>{
    setLoading(true)
    setError(null)
    try{
      await registerUser(email, password)
      navigate('/login')
    }catch(err){
      setError(err.message)
    }finally{
      setLoading(false)
    }
  }

  return {login, register, logout, user, loading, error}

}