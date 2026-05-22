import { useState, useEffect } from 'react'
import { getStatements } from '../api/statementApi'
import { Link } from 'react-router-dom'
import logger from '../utils/logger'
import './StatementList.css'

function StatementList() {
    const [statements, setStatements] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    useEffect(() => {
        logger.debug('Fetching statements...')
        getStatements()
            .then(response => {
                logger.debug('Fetched statements:', response.data)
                setStatements(response.data)
                setLoading(false)
            })
            .catch(err => {
                logger.error('Error fetching statements:', err)
                setError('Failed to load statements')
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    const filtered = statements.filter(s => {
        const matchesSearch = search === '' ||
            s.servicesForName.toLowerCase().includes(search.toLowerCase()) ||
            s.controlNumber.toString().includes(search)
        const matchesFrom = fromDate === '' || s.serviceDate >= fromDate
        const matchesTo = toDate === '' || s.serviceDate <= toDate
        return matchesSearch && matchesFrom && matchesTo
    })

    return (
        <div className="page statement-list">
            <h1>Statements</h1>
            <div className="statement-filters">
                <div className="form-field">
                    <label htmlFor="search">Search</label>
                    <input id="search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or control number" />
                </div>
                <div className="form-field">
                    <label htmlFor="fromDate">From</label>
                    <input id="fromDate" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="form-field">
                    <label htmlFor="toDate">To</label>
                    <input id="toDate" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
            </div>
            {statements.length === 0 ? (
                <div className="empty-state">
                    <p>No statements found. <Link to="/statements/new" className="btn btn-primary">Create a new statement</Link>.</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <p>No results</p>
                </div>
            ) : (
                <ul>
                    {filtered.map(statement => (
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