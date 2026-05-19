import { useState, useEffect } from 'react'
import { getStatements } from '../api/statementApi'
import { Link } from 'react-router-dom'
import './StatementList.css'

function StatementList() {
    const [statements, setStatements] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        getStatements()
            .then(response => {
                setStatements(response.data)
                setLoading(false)
            })
            .catch(err => {
                setError('Failed to load statements')
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="page statement-list">
            <h1>Statements</h1>
            {statements.length === 0 ? (
                <div className="empty-state">
                    <p>No statements found. <Link to="/statements/new" className="btn btn-primary">Create a new statement</Link>.</p>
                </div>
            ) : (
                <ul>
                    {statements.map(statement => (
                        <li key={statement.id}>
                            <Link to={`/statements/${statement.id}`}>
                                <span className="statement-number">#{statement.controlNumber} {statement.servicesForName}</span>
                                <span className="statement-service-date"> Service: {statement.serviceDate}</span>
                                <span className="statement-saved-date"> Saved: {new Date(statement.savedAt).toLocaleString()}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default StatementList;