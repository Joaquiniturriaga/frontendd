import { useState, useEffect, useRef, useCallback } from 'react'
import { apiFetch } from '../api/client'

export function useLocation() {
  const [userLocation, setUserLocation]   = useState(null)
  const [nearbyAlerts, setNearbyAlerts]   = useState([])
  const [newAlert, setNewAlert]           = useState(null)  // triggers toast
  const [locationError, setLocationError] = useState(null)
  const intervalRef   = useRef(null)
  const watchRef      = useRef(null)
  const prevAlertIds  = useRef(new Set())

  const postLocation = useCallback(async (lat, lng) => {
    try {
      await apiFetch('/api/notifications/location', {
        method: 'POST',
        body: JSON.stringify({ lat, lng }),
      })
    } catch (err) {
      console.error('Error posting location:', err.message)
    }
  }, [])

  const fetchMyAlerts = useCallback(async () => {
    try {
      const data = await apiFetch('/api/notifications/location/my')
      const alerts = Array.isArray(data) ? data : []
      setNearbyAlerts(alerts)

      // detect new alerts since last poll
      const newOnes = alerts.filter(a => !prevAlertIds.current.has(a.id))
      if (newOnes.length > 0) {
        setNewAlert(newOnes[0]) // show most recent
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

    // watchPosition updates continuously as user moves
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        await postLocation(latitude, longitude)
      },
      () => setLocationError('Location permission denied'),
      { enableHighAccuracy: true, maximumAge: 10000 }
    )
  }, [postLocation])

  useEffect(() => {
    requestLocation()
    fetchMyAlerts()

    // poll alerts every 30s
    intervalRef.current = setInterval(fetchMyAlerts, 30000)

    return () => {
      clearInterval(intervalRef.current)
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [requestLocation, fetchMyAlerts])

  const dismissAlert = () => setNewAlert(null)

  return { userLocation, nearbyAlerts, newAlert, locationError, requestLocation, dismissAlert }
}