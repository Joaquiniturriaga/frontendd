import { useState, useEffect } from 'react'
import { useUserProfile } from '../hooks/useUserProfile'
import { useAuth } from '../hooks/useAuth'

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

  if (loading) return <p>Loading profile...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h1>My profile</h1>
      {success && <p style={{ color: 'green' }}>Perfil actualizado</p>}
      <form onSubmit={handleSubmit}>
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
      <hr style={{ margin: '24px 0' }} />
      <h2>Sesión</h2>
      <button
        onClick={logout}
        style={{ backgroundColor: '#cc2200', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
