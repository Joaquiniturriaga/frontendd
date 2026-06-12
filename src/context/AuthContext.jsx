import { createContext, useContext, useState } from "react";

//Use state sirve estados (pueden cambiar)
//Create context permite compartir datos entre componentes
//AuthContext permite consumir un contexto ejemplo: const data = useContext[MiContext] 
const AuthContext = createContext(null)

//AuthProvider envuelve toda la app y children es todo dentro de la app
//aqui extraemos el usuario mediante getItem.localStorage('user') y retornamos el guardado usuario
//en json una vez transformado:)
export function AuthProvider({children}){
    const [user, setUser] = useState(() => { // la funcion (()=>) se llama lazi initialization
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    })

    const saveSession = (token, userData) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData)) //Localstorage acepta solo strings
        setUser(userData) //actualizamos el estado y todos los componentes se enteran
    }

    //Creamos una variable clear session donde removemos el token y el usuario y asignamos null
    const clearSession = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }


    //provider comparte datos globalmente todos los componentes hijos podran acceder a esto
    //que usan? usan usuario actual, login y logout
    return(
    <AuthContext.Provider value={{ user, saveSession, clearSession }}>
                {children}
            
            </AuthContext.Provider>
    )

}

//Y creamos un hooks personaizado llamado y con useAuthContext leeimos y suscribimos a un 
//contexto este contexto es todo el login logout y usuari actual

export const useAuthContext = () => useContext(AuthContext)
