import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStatement, getStatementPdf } from '../api/statementApi'
import './StatementDetail.css'

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
        <div className="page statement-detail">
            <div className="detail-card">
                <h2 className="section-header">Service Information</h2>
                <div className="detail-row">
                    <span className="detail-label">Control Number</span>
                    <span className="detail-value">{statement.controlNumber}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Services For</span>
                    <span className="detail-value">{statement.servicesForName}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Service Date</span>
                    <span className="detail-value">{statement.serviceDate}</span>
                </div>
                <div className="detail-actions">
                    <button className="btn btn-primary" onClick={handleDownloadPdf}>
                        Download PDF
                    </button>
                    <Link className="btn btn-secondary" to={`/statements/${id}/edit`}>
                        Edit
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default StatementDetail;