import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

//Fetch al back
fetch(import.meta.env.VITE_API_URL + '/')
//Busca el elemento root del indext 
createRoot(document.getElementById('root')).render(
  //StrictMode renderiza la app
  <StrictMode>
    <App />
  </StrictMode>
)