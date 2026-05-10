import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

export function ProtectedRoute({children}){
    const {user} = useAuthContext()
    return user ? children : <Navigate to ="/login" replace/>
}