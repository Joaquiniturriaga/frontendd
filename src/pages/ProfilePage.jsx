import { useState, useEffect } from 'react'
import { useUserProfile } from '../hooks/useUserProfile'
import { useAuth } from '../hooks/useAuth'
import '../styles/pages/ProfilePage.css'

export default function ProfilePage() {
  const { profile, loading, error, update } = useUserProfile()
  const { logout } = useAuth()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setEmail(profile.email || '')
      setName(profile.name || '')
    }
  }, [profile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    try {
      await update(email, name)
      setSuccess(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="profile-loading">Loading profile...</p>
  if (error) return <p className="profile-error">{error}</p>

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h1>My profile</h1>

        {success && <p className="profile-success">✓ Perfil actualizado</p>}

        <form className="profile-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Update'}
          </button>
        </form>

        <hr className="profile-divider" />

        <h2>Sesión</h2>
        <button className="profile-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}