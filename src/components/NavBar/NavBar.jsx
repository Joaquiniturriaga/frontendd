import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { theme, toggleTheme } = useTheme()

  const links = [
    { label: 'Home',       ruta: '/home',       icon: <IconHome size={16} /> },
    { label: 'Reports',    ruta: '/dashboard',  icon: <IconClipboardList size={16} /> },
    { label: 'Fire map',   ruta: '/map',        icon: <IconMap size={16} /> },
    ...(user?.role === 'admin' ? [
      { label: 'Overview', ruta: '/admin/home', icon: <IconLayoutDashboard size={16} /> },
      { label: 'Panel',    ruta: '/admin',      icon: <IconSettings size={16} /> },
    ] : []),
  ]

  const mobileLinks = [
    { label: 'Profile', ruta: '/profile', icon: <IconUser size={16} /> },
    ...links,
  ]

  const mobileActions = [
    {
      label: 'Toggle theme',
      action: () => {
        toggleTheme()
        setMenuAbierto(false)
      },
      icon: theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />,
    },
  ]

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
              className="navbar__user-button"
              onClick={() => navigate('/profile')}
              aria-label="Go to profile"
            >
              <IconUser size={16} />
            </button>
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
        </div>
      </nav>

      {user && (
        <div className={`navbar__mobile-menu ${menuAbierto ? 'open' : ''}`}>
          {mobileActions.map(({ label, action, icon }) => (
            <button
              key={`mobile-action-${label}`}
              type="button"
              className="navbar__mobile-menu-button"
              onClick={action}
            >
              {icon}
              {label}
            </button>
          ))}
          {mobileLinks.map(({ label, ruta, icon }) => (
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