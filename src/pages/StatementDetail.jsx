import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStatement } from '../api/statementApi'

function StatementDetail() {
    const { id } = useParams()
    const [statement, setStatement] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        getStatement(id)
        .then(response => {
            setStatement(response.data)
            setLoading(false)
        })
        .catch(err => {
            setError('Failed to load statement')
            setLoading(false)
        })
    }, [id])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div>
            <h1>Statement Detail #{statement.controlNumber}</h1>
            <p>{statement.servicesForName}</p>
            <p>{statement.serviceDate}</p>
            <button>Download PDF</button>
            <Link to={`/statements/${id}/edit`}>Edit</Link>
        </div>
    )
}

export default StatementDetail;