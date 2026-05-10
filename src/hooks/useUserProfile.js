//Perfil y actualizacion

import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../api/user.api'

export function userProfile(){
    const [profile, setProfile] = useState(null)
    const [loading , setLoading] = useState(true)
    const [ error, setError]=useState(null)

    useState(()=>{
        getProfile()
        .then(setProfile)
        .catch(err => setError(err.message))
        .finally(()=>setLoading(false))

    },[])


  const update = async (email, name) => {
    try {
      const updated = await updateProfile(email, name)
      setProfile(updated)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }
  return { profile, loading, error, update }

}