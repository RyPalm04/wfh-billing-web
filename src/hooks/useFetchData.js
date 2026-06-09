import { useState, useEffect } from 'react'

export function useFetchData(fetchFunction, dependencies = []) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [counter, setCounter] = useState(0)
    const refresh = () => setCounter(c => c + 1)

    useEffect(() => {
        fetchFunction()
        .then(result => { setData(result); setLoading(false)})
        .catch(() => { setError(true); setLoading(false)})
    }, [counter, ...dependencies])

    return { data, loading, error, refresh }
}