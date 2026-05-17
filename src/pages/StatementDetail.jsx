import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStatement, getStatementPdf } from '../api/statementApi'

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

    function handleDownloadPdf() {
        getStatementPdf(id)
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `statement-${id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        })
        .catch(() => {
            alert('Failed to download PDF')
        })
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div>
            <h1>Statement Detail #{statement.controlNumber}</h1>
            <p>{statement.servicesForName}</p>
            <p>{statement.serviceDate}</p>
            <button onClick={handleDownloadPdf}>Download PDF</button>
            <Link to={`/statements/${id}/edit`}>Edit</Link>
        </div>
    )
}

export default StatementDetail;