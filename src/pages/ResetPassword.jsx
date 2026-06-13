import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import '../styles/pages/LoginPage.css';

const API = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const [searchParams]        = useSearchParams();
  const navigate              = useNavigate();
  const { clearSession }      = useAuthContext();
  const token                 = searchParams.get('token');

  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    clearSession(); // limpia sesión al abrir el link del email
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirm) return setError('Las contraseñas no coinciden');
    if (newPassword.length < 8)  return setError('Mínimo 8 caracteres');
    if (!token)                  return setError('Token inválido. Solicita un nuevo enlace.');

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al restablecer');

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-box" style={{ textAlign: 'center' }}>
          <h1>¡Listo!</h1>
          <p className="login-success">Contraseña actualizada correctamente.</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Nueva contraseña</h1>
        <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Mínimo 8 caracteres.
        </p>

        {error && <p className="login-error">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}