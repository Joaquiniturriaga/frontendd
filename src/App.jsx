import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
//Habilitamos el sistema de rutas, contenedor de rutas, definiinr rutas, redirige a otra ruta
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
import './App.css'

//Children es el componente que esta adentro
function AdminRoute({ children }) {
  const { user } = useAuthContext() //Ocumaos todo lo de auth context del provider y nos quedamos con user
  if (!user) return <Navigate to="/login" replace />//Si no existe el usuario
  if (user.role !== 'admin') return <Navigate to="/home" replace />//Si es admin
  return children
}

function AppContent() { //
  const { user } = useAuthContext()
  return (
    <>
      {user && <NavBar />}//Si user esta mostramos
      <Routes>
        <Route path="/"           element={<Navigate to="/login" replace />} />
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/register"   element={<RegisterPage />} />
        <Route path="/home"       element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/map"        element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/admin"      element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/home" element={<AdminRoute><AdminHomePage /></AdminRoute>} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>//React entiende con esto
      <AuthProvider>//Auth provider nos hace disponible lo de auth context
        <ThemeProvider>  //Tema
          <AppContent /> //Rutas
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}