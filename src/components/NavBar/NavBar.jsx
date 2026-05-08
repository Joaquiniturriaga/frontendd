import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './NavBar.css'

const links = [
  { label: 'Inicio',              ruta: '/' },
  { label: 'Mapa de incendios',   ruta: '/' },
]

export default function NavBar() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar__brand">
          <span className="navbar__title">Sistema de Reportes</span>
        </Link>

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

        <button
          className="navbar__hamburger"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>


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
    </>
  )
}