import { useState } from "react";
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function LoginPage(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {login, loading, error} = useAuth()

    const handleSubmit = async(e)=>{
        e.preventDefault()
        await login(email, password)
    }
    return(
        <div>
            <h1> Log in </h1>
            {error && <p style={{color:'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="email" 
                placeholder="Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                />

                <input type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Entering....': 'Enter'}
                </button>

            </form>
{            //OJO A ESTE DETALLE HRMANO
}                  <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>

        </div>
    )
}