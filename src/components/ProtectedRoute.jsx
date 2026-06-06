import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

//Componente react la trata asi por que empiza en mayus xd
export function ProtectedRoute({children}){
    const {user} = useAuthContext()
    //Operador ternario
    //Si usuario esta devolveremos children que es la ruta que esta en app y si no directo al login
    return user ? children : <Navigate to ="/login" replace/>
}