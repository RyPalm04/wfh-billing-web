import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStatement, getStatementPdf, updateStatement } from '../api/statementApi'
import { displayPrice } from '../utils/price'
import toast from 'react-hot-toast'
import logger from '../utils/logger'
import './StatementDetail.css'
import PriceInput from '../components/PriceInput'
import { useFetchData } from '../hooks/useFetchData'
import { formatDate } from '../utils/date'

function StatementDetail() {
    const { id } = useParams()
    const { data: statement, loading, error } = useFetchData(() => getStatement(id).then(r => r.data), [id])
    const [editingPayment, setEditingPayment] = useState(false)
    const [downPayment, setDownPayment] = useState('')
    const [savedPayment, setSavedPayment] = useState('')
    const navigate = useNavigate()

    function DetailRow({ label, value, className }) {
        return (
            <div className={`detail-row${className ? ` ${className}` : ''}`}>
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
            </div>
        )
    }

    function handleKeyDown(event) {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.isContentEditable) {
            return
        }

        if (event.code === 'KeyE' && !event.shiftKey && !editingPayment) {
            logger.debug('E key pressed - entering down payment edit mode for statement', id)
            setEditingPayment(true)
        } else if (event.code === 'KeyD' && !editingPayment) {
            logger.debug('Shift+D key pressed - downloading PDF for statement', id)
            handleDownloadPdf()
        } else if (event.code === 'KeyE' && event.shiftKey) {
            logger.debug('Shift+E keys pressed - navigating to edit page for statement', id)
            navigate(`/statements/${id}/edit`)
        }

        if (editingPayment) {
            if (event.key === 'Enter') {
                logger.debug('Saving down payment for statement', id, 'value:', downPayment)
                handleSavePayment()
            } else if (event.key === 'Escape') {
                logger.debug('Cancelling down payment edit for statement', id)
                setDownPayment(savedPayment)
                setEditingPayment(false)
            }
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [editingPayment, downPayment, savedPayment])

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
    
    useEffect(() => {
        if (statement) {
            setDownPayment(statement.payment ?? '')
            setSavedPayment(statement.payment ?? '')
        }
    }, [statement])


    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>


    const packageCost = parseFloat(statement.servicePackage?.defaultCost || 0)
    const servicesTotal = (
        packageCost +
        statement.services
            .filter(s => !s.inPackage)
            .reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0)
    ).toFixed(2)
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
                <DetailRow label="Control Number" value={statement.controlNumber} />
                <DetailRow label="Services For" value={statement.servicesForName} />
                {statement.serviceDate && (
                    <DetailRow label="Service Date" value={formatDate(statement.serviceDate)} />
                )}
                <div className="detail-section">
                    <h3 className="detail-section-header">Services, Facilities, & Transportation</h3>
                    {statement.servicePackage && (
                        <>
                            <DetailRow label={`Package: ${statement.servicePackage.name}${statement.servicePackage.legacyPackage ? ' (Legacy)' : ''}`} value={displayPrice(statement.servicePackage.defaultCost)} />
                            {statement.services.filter(s => s.inPackage).map(s => (
                                <DetailRow key={s.serviceId} label={s.name} value="Included" className="detail-row detail-row--package-service"/>
                            ))}
                        </>
                    )}
                    {statement.reasonForEmbalming && statement.reasonForEmbalming !== 'null' && (
                        <div className="detail-row detail-row--package-service">
                            <span className="detail-label">
                                Reason for Embalming
                            </span>
                            <span className="detail-value detail-value--plain">
                                {statement.reasonForEmbalming}
                            </span>
                        </div>
                    )}
                    {(() => {
                        const nonPackageServices = statement.services.filter(s => !s.inPackage)
                        if (nonPackageServices.length === 0 && !statement.servicePackage) {
                            return (
                                <DetailRow label="None" value="$0.00" />
                            )
                        }
                        return nonPackageServices.map(s => (
                            <DetailRow key={s.serviceId} label={s.name} value={displayPrice(s.price)} />
                        ))
                    })()}
                    <DetailRow label="Services Total" value={displayPrice(servicesTotal)} className = "detail-row detail-section-total" />
                </div>
                <div className="detail-section">
                    <h3 className="detail-section-header">Merchandise</h3>
                    {statement.merchandise.map(m => (
                        <DetailRow key={m.merchandiseId} label={`${m.name}${m.description ? ` — ${m.description}` : ''}`} value={displayPrice(m.price)} />
                    ))}
                    <DetailRow label="Merchandise Total" value={displayPrice(merchandiseTotal)} className="detail-row detail-section-total" />
                </div>
                <div className="detail-section">
                    <h3 className="detail-section-header">Special Charges</h3>
                    {statement.specialCharges.map(c => (
                        <DetailRow key={c.specialChargeId} label={`${c.name}${c.description ? ` — ${c.description}` : ''}`} value={displayPrice(c.price)} />
                    ))}
                    <DetailRow label="Special Charges Total" value={displayPrice(specialChargesTotal)} className="detail-row detail-section-total" />
                </div>
                <div className="detail-section">
                    <h3 className="detail-section-header">Cash Advance Items</h3>
                    {statement.cashAdvances.map(a => (
                        <DetailRow key={a.cashAdvanceId} label={`${a.name}${a.provider ? ` — ${a.provider}` : ''}`} value={displayPrice(a.amount)} />
                    ))}
                    <DetailRow label="Cash Advances Total" value={displayPrice(cashAdvancesTotal)} className="detail-row detail-section-total" />
                </div>
                <div className="detail-totals">
                    <DetailRow label="Subtotal" value={displayPrice(subtotal)} />
                    <div className="detail-row">
                        <span className="detail-label">Down Payment</span>
                        {editingPayment ? (
                            <div className="detail-payment-edit">
                                <PriceInput
                                    value={downPayment}
                                    onValueChange={e => setDownPayment(e)}
                                    placeholder="$0.00"
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
                                <span className="detail-value">{downPayment ? displayPrice(downPayment) : '—'}</span>
                            </div>
                        )}
                    </div>
                    <DetailRow label="Balance Due" value={displayPrice(balanceDue)} className="detail-row detail-grand-total" />
                </div>
                <div className="detail-actions">
                    <button disabled={editingPayment} className="btn btn-secondary" onClick={() => setEditingPayment(true)}>
                        Edit Down Payment <span className="kbd-hint">(E)</span>
                    </button>
                    <button className="btn btn-primary" onClick={handleDownloadPdf}>
                        Download PDF <span className="kbd-hint">(D)</span>
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate(`/statements/${id}/edit`)}>
                        Edit <span className="kbd-hint">(Shift+E)</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StatementDetail;