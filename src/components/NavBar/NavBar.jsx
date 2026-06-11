import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './NavBar.css'
import { useAuthContext } from '../../context/AuthContext'


export default function NavBar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
    const { user } = useAuthContext()

const links = [
  { label: 'Dashboard',         ruta: '/dashboard' },
  { label: 'Mapa de incendios', ruta: '/map' },  
  { label: 'Perfil',            ruta: '/profile' },
  ...(user?.role === 'admin' ? [{ label: '⚙️ Admin', ruta: '/admin' }] : []),

]
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar__brand">
          <span className="navbar__title">Sistema de Reportes</span>
        </Link>
        {user && (
        <ul className="navbar__links">
          {links.map(({ label, ruta }) => (
            <li key={ruta}>
              <NavLink
                to={ruta}
                className={({ isActive }) => isActive ? 'active' : ''}
                end
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
                )}

        {user && (

        <button
          className="navbar__hamburger"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
        >
          <span />
          <span />
          <span />
        </button>
                )}

      </nav>

      {user && (

      <div className={`navbar__mobile-menu ${menuAbierto ? 'open' : ''}`}>
        
        {links.map(({ label, ruta }) => (
          <NavLink
            key={ruta}
            to={ruta}
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={() => setMenuAbierto(false)}
            end
          >
            {label}
          </NavLink>
        ))}
      </div>
      )}
    </>
  )
}