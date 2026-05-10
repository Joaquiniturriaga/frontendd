import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link} from "react-router-dom"

export default function RegisterPage(){
    const [email, setEmail] = useState('')
    const [password, setPassword]= useState('')
    const {register, loading, error} = useAuth()

    const handleSubmit = async (e) =>{
        e.preventDefault()
        await register (email, password)
    }

    return(
        <div>
            <h1>Register</h1>
            {error && <p style={{color:'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input 
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required                
                />

                <input type="password"
                placeholder="Password (Min 8 characteres)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' :'Register'}
                    
                </button>
            </form>
            <p>¿You have already an account? <Link to="/login">Log in</Link></p>
        </div>
    )
}