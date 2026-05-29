import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './NavBar.css'
import { useAuthContext } from '../../context/AuthContext'

export default function NavBar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { user } = useAuthContext()

const links = [
  { label: 'Home',        ruta: '/home'       },
  { label: 'Reports',     ruta: '/dashboard'  },
  { label: 'Fire map',    ruta: '/map'        },
  { label: 'My profile',  ruta: '/profile'    },
  ...(user?.role === 'admin' ? [
    { label: '⚙️ Overview', ruta: '/admin/home' },
    { label: '⚙️ Panel',    ruta: '/admin'      },
  ] : []),
]

  return (
    <>
      <nav className="navbar">
        <Link to="/home" className="navbar__brand">
          <span className="navbar__title">Fire Report System</span>
        </Link>

        {user && (
          <ul className="navbar__links">
            {links.map(({ label, ruta }) => (
              <li key={`desktop-${ruta}`}> 
                  <NavLink
                  to={ruta}
                  className={({ isActive }) => isActive ? 'active' : ''}
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
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        )}
      </nav>

      {user && (
        <div className={`navbar__mobile-menu ${menuAbierto ? 'open' : ''}`}>
          {links.map(({ label, ruta }) => (
            <NavLink 
              key={`mobile-${ruta}`}  // ← agregar prefijo
              to={ruta}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setMenuAbierto(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}