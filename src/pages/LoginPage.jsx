import { useState } from "react";
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import '../styles/pages/LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>

        {error && <p className="login-error">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Entering...' : 'Enter'}
          </button>
        </form>

        <p className="login-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>

        <p className="login-footer">
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        </p>  
      </div>
    </div>
  )
}

