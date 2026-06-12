import { useState, useEffect, useRef, useCallback } from 'react'
import { apiFetch } from '../api/client'


export function useLocation() {
  //Ubicacion actual del usuario
  const [userLocation, setUserLocation]   = useState(null) 
  //Alertas cercanas obtenidas desde el backend
  const [nearbyAlerts, setNearbyAlerts]   = useState([])
  //Ultima alerta obtenida
  const [newAlert, setNewAlert]           = useState(null)  
  //Error respecto a permisos del navegador ubicacion
  const [locationError, setLocationError] = useState(null)
  //Guardamos la id del setInterval
  const intervalRef   = useRef(null)
  //Guarda el id de watchPosition
  const watchRef      = useRef(null)
  //Guardamos la id de reportes ya conocidos 
  //Se usa para detectar nuevas alertas
  const prevAlertIds  = useRef(new Set())

  //Mandamos lat y lng al backend
  const postLocation = useCallback(async (lat, lng) => {
    try {
      //Mandamos la ubicacion al backend funcion asincrona que realiza peticion al backend
      await apiFetch('/api/notifications/location', {
        method: 'POST',
        body: JSON.stringify({ lat, lng }),
      })
    } catch (err) {
      console.error('Error posting location:', err.message)
    }
  }, [])

  //Obtenemos alertas cercanas
  const fetchMyAlerts = useCallback(async () => {
    try {
      //Solicitamos alertas cercanas al backend
      const data = await apiFetch('/api/notifications/location/my')
      //Validamos que exista la ubi
      const alerts = Array.isArray(data) ? data : []
      //Actualizamos el estado
      setNearbyAlerts(alerts)
      // detect new alerts since last poll
      const newOnes = alerts.filter(a => !prevAlertIds.current.has(a.id))
      //Almacenamos en newOnes y verificamos si existe el id 
      if (newOnes.length > 0) {
        setNewAlert(newOnes[0]) // Guardamos la primera para mostrarla
        newOnes.forEach(a => prevAlertIds.current.add(a.id))
      }
    } catch (err) {
      console.error('Error fetching alerts:', err.message)
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser')
      return
    }

    // watchPosition escucha cambios de ubicacion
    watchRef.current = navigator.geolocation.watchPosition(
      //Nueva posicion detectada
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude }) //Actualizaoms ubciacion en react
        await postLocation(latitude, longitude) //Enviamos ubi al backend
      },
      () => setLocationError('Location permission denied'),
      { enableHighAccuracy: true, maximumAge: 10000 }
    )
  }, [postLocation])

  useEffect(() => {
    requestLocation() //Solicita acceso al GPS
    fetchMyAlerts() // Obtenemos alertas al inciar 

    // poll alerts every 30s
    intervalRef.current = setInterval(fetchMyAlerts, 30000)

    return () => {
      clearInterval(intervalRef.current)
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current) //Detemos seguimiendo
    }
  }, [requestLocation, fetchMyAlerts])

  const dismissAlert = () => setNewAlert(null)

  return { userLocation, nearbyAlerts, newAlert, locationError, requestLocation, dismissAlert }
}