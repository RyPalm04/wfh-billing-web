import { useState, useEffect } from 'react'
import { getCatalog } from '../api/catalogApi'
import { createStatement, getNextControlNumber } from '../api/statementApi'
import './NewStatement.css'

function NewStatement() {
    const [catalog, setCatalog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [controlNumber, setControlNumber] = useState('')
    const [servicesForName, setServicesForName] = useState('')
    const [serviceDate, setServiceDate] = useState('')
    const [dateOfDeath, setDateOfDeath] = useState('')
    const [placeOfDeath, setPlaceOfDeath] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    useEffect(() => {
        Promise.all([getCatalog(), getNextControlNumber()])
            .then(([catalogResponse, controlNumberResponse]) => {
                setCatalog(catalogResponse.data)
                setControlNumber(controlNumberResponse.data)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setError('Failed to load catalog')
                setLoading(false)
            })
    }, [])

    function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setSuccessMessage(null)
        createStatement({ controlNumber, servicesForName, serviceDate, dateOfDeath, placeOfDeath })
            .then(response => {
                setSuccessMessage(`Statement #${response.data.controlNumber} created successfully!`)
                setSubmitting(false)
            })
            .catch(error => {
                console.error('Error creating statement:', error)
                setSubmitError('Failed to create statement')
                setSubmitting(false)
            })
    }

    if (loading) {
        return <div className="page">Loading...</div>
    }

    if (error) {
        return <div>{error}</div>
    }

    return <div className="page new-statement">
        <h1>New Statement</h1>
        {submitError && <div className="error">{submitError}</div>}
        {successMessage && <div className="success">{successMessage}</div>}
        <form onSubmit={handleSubmit}>
            <div className="form-field">
                <label htmlFor="controlNumber">Control Number</label>
                <input id="controlNumber" type="text" value={controlNumber} readOnly />
            </div>
            <div className="form-field">
                <label htmlFor="servicesForName">Services For Name</label>
                <input id="servicesForName" type="text" value={servicesForName} onChange={e => setServicesForName(e.target.value)} required />
            </div>
            <div className="form-field">
                <label htmlFor="serviceDate">Service Date</label>
                <input id="serviceDate" type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} />
            </div>
            <div className="form-field">
                <label htmlFor="placeOfDeath">Place of Death</label>
                <input id="placeOfDeath" type="text" value={placeOfDeath} onChange={e => setPlaceOfDeath(e.target.value)} />
            </div>
            <div className="form-field">
                <label htmlFor="dateOfDeath">Date of Death</label>
                <input id="dateOfDeath" type="date" value={dateOfDeath} onChange={e => setDateOfDeath(e.target.value)} />
            </div>
            <div className="form-submit form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>Create Statement</button>
            </div>
        </form>
    </div>
}

export default NewStatement;