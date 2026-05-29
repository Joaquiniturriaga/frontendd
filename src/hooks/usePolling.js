import { useEffect, useRef } from 'react'


//Esta es una funcion repetida cada cierto tiempo polling es preguntar repetidamente
// callback = funcion a ejecutar, intervalMs, = cada cuanto, runImmediately = si ejecuta inmediatamente

export function usePolling(callback, intervalMs, runImmediately = true) {
  // ref para no reiniciar el intervalo si callback cambia entre renders
  // Se mantiene con useRef setInternal "recuerda" valores antiguos
  const callbackRef = useRef(callback) // creamos funcion
  // React siempre recrea funciones en cada render.
  //si no hicieramos esto setInternval poodria quedarse con una versiona antigua esto se llama STALE CLOSURE

  useEffect(() => { callbackRef.current = callback }, [callback]) // apunta a version mas nueva

  useEffect(() => {
    //Ejecuta runImmediately inmediatamente si es True  sin esto el usuario espera intervalMs antes
    //De la primera ejecucion
    if (runImmediately) callbackRef.current()

    //Usamos setInterval repetidamente , y usamos callbackRef.current() y no callback directamente
    //por que callback podria quedase con valores viejos
    const id = setInterval(() => callbackRef.current(), intervalMs)
    //React ejecuta esto cuando el componente se desmonta y cambian dependencias del effect
    //evita memory leaks intervalos duplicados
    //consumo innecesario
    return () => clearInterval(id)
  }, [intervalMs, runImmediately])
}

//Use ref sive para timers DOM valores persistentes y referencias mutables no cambia no renderiza