import { useEffect, useRef } from 'react'

//Esto es criminal..

//Esto es un hook que ejecuta una funcion repetidamente cada cierto tiempo
//Callback: Funcion a ejecutar
//IntervalMs: Intervalos en milisegundos
//runImmediately; Si es true, ejecuta callback inmediatamente

export function usePolling(callback, intervalMs, runImmediately = true) {
// useRef guarda un valor entre renders sin provocar re-render.
// callbackRef.current siempre apuntará a la versión más reciente del callback.
  const callbackRef = useRef(callback) 

// useEffect se ejecuta después del render.
// Se usa para sincronizar efectos secundarios.
  //Asi evitamos que setInterval use una funcion antigua
// Cada vez que callback cambia,
// actualizamos callbackRef.current con la nueva versión.
  useEffect(() => { callbackRef.current = callback }, [callback]) 


  useEffect(() => {
    //Ejecuta la funcion inmeddiata mente al montar el componente
    //Sin esto tendriamos que esperar intervalos
    if (runImmediately) callbackRef.current()

      // Creamos un intervalo.
// El intervalo ejecutará siempre la versión más reciente del callback.
    const id = setInterval(() => callbackRef.current(), intervalMs)

    //Limpieza 
    //Se ejecuta cuando el componente se desmonta
    return () => clearInterval(id)
  }, [intervalMs, runImmediately])
}

//Use ref sive para timers DOM valores persistentes y referencias mutables no cambia no renderiza