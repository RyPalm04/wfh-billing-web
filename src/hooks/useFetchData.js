import { useState, useEffect } from 'react'

export function useFetchData(fetchFunction, dependencies = []) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchFunction()
        .then(result => { setData(result); setLoading(false)})
        .catch(() => { setError(true); setLoading(false)})
    }, dependencies)

    return { data, loading, error }
}