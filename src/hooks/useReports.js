//fetch, crear reporte, estado loading/error

import { useState, useEffect } from "react";
import { getReports, createReport } from '../api/report.api'

export function useReports(){
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchReports = async() => {
        setLoading(true)
        try{
            const data = await getReports()
            setReports(data)
        }catch(err){
            setError(err.message)
        }finally{
            setLoading(false)
        }
    }


    const addReport = async(title , description , lat, lng, tipo )=>{
        try {
            const newReport = await createReport(title, description, lat, lng, tipo)
            setReports(prev => [newReport, ...prev])
            return newReport
        }catch(err){
            setError(err.message)
            throw err
        }
    }


    useEffect(() =>{
        fetchReports()
    }, [])

    return {reports, loading,error, addReport, refetch: fetchReports}
}