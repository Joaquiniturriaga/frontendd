import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/LoginPage.css'; // reutiliza los mismos estilos

const API = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Recuperar contraseña</h1>
        <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Ingresa tu email y te enviaremos un enlace para restablecerla.
        </p>

        {error   && <p className="login-error">{error}</p>}
        {message && <p className="login-success">{message}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <p className="login-footer">
          <Link to="/login">← Volver al login</Link>
        </p>
      </div>
    </div>
  );
}