import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  IconHome,
  IconClipboardList,
  IconMap,
  IconUser,
  IconLayoutDashboard,
  IconSettings,
  IconFlame,
  IconSun,
  IconMoon,
} from '@tabler/icons-react'
import '../../styles/components/navBar/NavBar.css'
import { useAuthContext } from '../../context/AuthContext'
import { useTheme } from '../context/ThemeContext'  

export default function NavBar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { user } = useAuthContext()
  const { theme, toggleTheme } = useTheme()

const links = [
  { label: 'Dashboard',         ruta: '/dashboard' },
  { label: 'Mapa de incendios', ruta: '/map' },  
  { label: 'Perfil',            ruta: '/profile' },
  ...(user?.role === 'admin' ? [{ label: '⚙️ Admin', ruta: '/admin' }] : []),

  return (
    <>
      <nav className="navbar">
        <Link to="/home" className="navbar__brand">
          <IconFlame size={20} className="navbar__brand-icon" aria-hidden="true" />
          <span className="navbar__title">Fire Report System</span>
        </Link>

        {user && (
          <ul className="navbar__links">
            {links.map(({ label, ruta, icon }) => (
              <li key={`desktop-${ruta}`}>
                <NavLink
                  to={ruta}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {icon}
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        <div className="navbar__right">
          <button
            className="navbar__theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
          </button>

          {user && (
            <button
              className="navbar__hamburger"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Open menu"
            >
              <span /><span /><span />
            </button>
          )}
        </div>
      </nav>

      {user && (
        <div className={`navbar__mobile-menu ${menuAbierto ? 'open' : ''}`}>
          {links.map(({ label, ruta, icon }) => (
            <NavLink
              key={`mobile-${ruta}`}
              to={ruta}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setMenuAbierto(false)}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}