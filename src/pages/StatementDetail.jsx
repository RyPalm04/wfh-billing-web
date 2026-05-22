import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStatement, getStatementPdf, updateStatement } from '../api/statementApi'
import { sanitizePrice, formatPrice } from '../utils/price'
import toast from 'react-hot-toast'
import logger from '../utils/logger'
import './StatementDetail.css'

function StatementDetail() {
    const { id } = useParams()
    const [statement, setStatement] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingPayment, setEditingPayment] = useState(false)
    const [downPayment, setDownPayment] = useState('')
    const [savedPayment, setSavedPayment] = useState('')

    useEffect(() => {
        logger.debug('Fetching statement...')
        getStatement(id)
            .then(response => {
                logger.debug('Fetched statement:', response.data)
                setStatement(response.data)
                setDownPayment(response.data.payment ?? '')
                setSavedPayment(response.data.payment ?? '')
                setLoading(false)
            })
            .catch(err => {
                logger.error('Error fetching statement:', err)
                setError('Failed to load statement')
                setLoading(false)
            })
    }, [id])

    function handleDownloadPdf() {
        logger.debug('Downloading statement PDF...')
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
                logger.debug('Downloaded PDF for statement', id)
            })
            .catch(() => {
                logger.debug('Failed to download PDF for statement', id)
                toast.error('Failed to download PDF')
            })
    }

    function handleSavePayment() {
        logger.debug('Saving down payment for statement', id, 'value:', downPayment)
        updateStatement(id, { ...statement, payment: downPayment })
            .then(() => {
                setSavedPayment(downPayment)
                setEditingPayment(false)
                toast.success('Down payment saved')
                logger.debug('Saved down payment for statement', id, 'value:', downPayment)
            })
            .catch(() => {
                logger.error('Failed to save down payment for statement', id, 'value:', downPayment)
                toast.error('Failed to save down payment')
            })
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>


    const servicesTotal = statement.services.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0).toFixed(2)
    const merchandiseTotal = statement.merchandise.reduce((sum, m) => sum + (parseFloat(m.price) || 0), 0).toFixed(2)
    const specialChargesTotal = statement.specialCharges.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0).toFixed(2)
    const cashAdvancesTotal = statement.cashAdvances.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0).toFixed(2)

    const subtotal = (
        parseFloat(servicesTotal) +
        parseFloat(merchandiseTotal) +
        parseFloat(specialChargesTotal) +
        parseFloat(cashAdvancesTotal)
    ).toFixed(2)

    const balanceDue = (parseFloat(subtotal) - parseFloat(downPayment || 0)).toFixed(2)

    return (
        <div className="page statement-detail">
            <div className="detail-card">
                <h2 className="section-header">Service Summary</h2>
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
                <div className="detail-section">
                    <h3 className="detail-section-header">Services, Facilities, & Transportation</h3>
                    {statement.services.length === 0 ? (
                        <div className="detail-row">
                            <span className="detail-label">None</span>
                            <span className="detail-value">$0.00</span>
                        </div>
                    ) : statement.services.map(s => (
                        <div key={s.serviceId} className="detail-row">
                            <span className="detail-label">{s.name}{s.inPackage ? ' (Package)' : ''}</span>
                            <span className="detail-value">${s.price}</span>
                        </div>
                    ))}
                    <div className="detail-row detail-section-total">
                        <span className="detail-label">Services Total</span>
                        <span className="detail-value">${servicesTotal}</span>
                    </div>
                </div>
                <div className="detail-section">
                    <h3 className="detail-section-header">Merchandise</h3>
                    {statement.merchandise.map(m => (
                        <div key={m.merchandiseId} className="detail-row">
                            <span className="detail-label">{m.name}{m.description ? ` — ${m.description}` : ''}</span>
                            <span className="detail-value">${m.price}</span>
                        </div>
                    ))}
                    <div className="detail-row detail-section-total">
                        <span className="detail-label">Merchandise Total</span>
                        <span className="detail-value">${merchandiseTotal}</span>
                    </div>
                </div>
                <div className="detail-section">
                    <h3 className="detail-section-header">Special Charges</h3>
                    {statement.specialCharges.map(c => (
                        <div key={c.chargeId} className="detail-row">
                            <span className="detail-label">{c.name}{c.description ? ` — ${c.description}` : ''}</span>
                            <span className="detail-value">${c.price}</span>
                        </div>
                    ))}
                    <div className="detail-row detail-section-total">
                        <span className="detail-label">Special Charges Total</span>
                        <span className="detail-value">${specialChargesTotal}</span>
                    </div>
                </div>
                <div className="detail-section">
                    <h3 className="detail-section-header">Cash Advance Items</h3>
                    {statement.cashAdvances.map(a => (
                        <div key={a.advanceId} className="detail-row">
                            <span className="detail-label">{a.name}{a.provider ? ` — ${a.provider}` : ''}</span>
                            <span className="detail-value">${a.amount}</span>
                        </div>
                    ))}
                    <div className="detail-row detail-section-total">
                        <span className="detail-label">Cash Advances Total</span>
                        <span className="detail-value">${cashAdvancesTotal}</span>
                    </div>
                </div>
                <div className="detail-totals">
                    <div className="detail-row">
                        <span className="detail-label">Subtotal</span>
                        <span className="detail-value">${subtotal}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Down Payment</span>
                        {editingPayment ? (
                            <div className="detail-payment-edit">
                                <input
                                    type="text"
                                    className="catalog-input-price"
                                    value={downPayment}
                                    onChange={e => setDownPayment(sanitizePrice(e.target.value))}
                                    onBlur={e => setDownPayment(formatPrice(e.target.value))}
                                    placeholder="0.00"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            logger.debug('Saving down payment for statement', id, 'value:', downPayment)
                                            handleSavePayment()
                                        } else if (e.key === 'Escape') {
                                            logger.debug('Cancelling down payment edit for statement', id)
                                            setDownPayment(savedPayment)
                                            setEditingPayment(false)
                                        }
                                    }}
                                />
                                <button className="btn btn-primary" onClick={handleSavePayment}>Save</button>
                                <button className="btn btn-secondary" onClick={() => {
                                    setDownPayment(savedPayment)
                                    setEditingPayment(false)
                                }}>Cancel</button>
                            </div>
                        ) : (
                            <div className="detail-payment-display">
                                <span className="detail-value">{downPayment ? `$${downPayment}` : '—'}</span>
                            </div>
                        )}
                    </div>
                    <div className="detail-row detail-grand-total">
                        <span className="detail-label">Balance Due</span>
                        <span className="detail-value">${balanceDue}</span>
                    </div>
                </div>
                <div className="detail-actions">
                    <button disabled={editingPayment} className="btn btn-secondary" onClick={() => setEditingPayment(true)}>
                        {downPayment ? 'Edit Down Payment' : 'Apply Down Payment'}
                    </button>
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