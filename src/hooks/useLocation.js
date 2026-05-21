import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../api/client'

export function useLocation() {
  const [userLocation, setUserLocation] = useState(null)
  const [nearbyAlerts, setNearbyAlerts] = useState([])
  const [locationError, setLocationError] = useState(null)
  const intervalRef = useRef(null)

  const postLocation = async (lat, lng) => {
    try {
      await apiFetch('/api/notifications/location', {
        method: 'POST',
        body: JSON.stringify({ lat, lng }),
      })
    } catch (err) {
      console.error('Error posting location:', err.message)
    }
  }

  const fetchMyAlerts = async () => {
    try {
      const data = await apiFetch('/api/notifications/location/my')
      setNearbyAlerts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching alerts:', err.message)
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        await postLocation(latitude, longitude)
        await fetchMyAlerts()
      },
      () => setLocationError('Location permission denied')
    )
  }

  useEffect(() => {
    requestLocation()
    intervalRef.current = setInterval(async () => {
      if (userLocation) {
        await postLocation(userLocation.lat, userLocation.lng)
      }
      await fetchMyAlerts()
    }, 30000)

    return () => clearInterval(intervalRef.current)
  }, [])

  return { userLocation, nearbyAlerts, locationError, requestLocation }
}