import { BrowserRouter, Routes, Route, Navigate, useLocation as useRouterLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuthContext } from './context/AuthContext'
import { ThemeProvider } from './components/context/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import NavBar from './components/NavBar/NavBar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import MapPage from './pages/MapPage'
import AdminPage from './pages/AdminPage'
import AdminHomePage from './pages/AdminHomePage'
import FireAgentPanel from './components/agent/FireAgentPanel'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import './App.css'

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password']

function AdminRoute({ children }) {
  const { user } = useAuthContext()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/home" replace />
  return children
}

function AppContent() {
  const { user } = useAuthContext()
  const location = useRouterLocation() 

  const isAuthPage = AUTH_PAGES.some(path => location.pathname.startsWith(path))

  return (
    <>
      {user && !isAuthPage && <NavBar />}
      <Routes>
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route path="/home"            element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/dashboard"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/map"             element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/admin"           element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/home"      element={<AdminRoute><AdminHomePage /></AdminRoute>} />
      </Routes>
      {user && !isAuthPage && <FireAgentPanel />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}