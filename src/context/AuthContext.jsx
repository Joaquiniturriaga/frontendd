//Manejamos User + token + login/logout

//El use state nos ayuda a manejrar el estado lcoal dentro de un componente
//Create context crea un "Contexto" que funciona coomo un contenedor global de datos lo
//usamos para compartir informacion entre componentes
//useContext permite consumir el contexto
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null)


export function AuthProvider({children}){
    const [user, setUser] = useState(()=>{
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse: null
    })

const saveSession = (token, userData) =>{
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
}

const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
}


 return (
    <AuthContext.Provider value={{ user, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)