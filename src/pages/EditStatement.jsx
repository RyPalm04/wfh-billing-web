import { useState, useEffect } from 'react'
import { getCatalog } from '../api/catalogApi'
import { getStatement, updateStatement } from '../api/statementApi'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './EditStatement.css'

function EditStatement() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [statement, setStatement] = useState(null)
    const [catalog, setCatalog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [servicesForName, setServicesForName] = useState('')
    const [serviceDate, setServiceDate] = useState('')
    const [dateOfDeath, setDateOfDeath] = useState('')
    const [placeOfDeath, setPlaceOfDeath] = useState('')
    const [controlNumber, setControlNumber] = useState('')
    const [selectedServices, setSelectedServices] = useState([])
    const [selectedMerchandise, setSelectedMerchandise] = useState([])
    const [selectedSpecialCharges, setSelectedSpecialCharges] = useState([])
    const [selectedCashAdvances, setSelectedCashAdvances] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [packageId, setPackageId] = useState(null)

    function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        updateStatement(id, {
            servicesForName,
            serviceDate,
            dateOfDeath,
            placeOfDeath,
            services: Object.values(selectedServices),
            merchandise: Object.values(selectedMerchandise).map(({ quantity, ...item }) => item),
            specialCharges: Object.values(selectedSpecialCharges),
            cashAdvances: Object.values(selectedCashAdvances),
            packageId
        })
            .then(() => {
                toast.success('Statement updated successfully')
                setSubmitting(false)
                navigate(`/statements/${id}`)
            })
            .catch(() => {
                toast.error('Failed to save statement')
                setSubmitting(false)
            })
    }

    function updateMerchandiseQuantity(id, quantity, defaultCost) {
        const qty = parseInt(quantity) || 1
        setSelectedMerchandise(prev => ({
            ...prev,
            [id]: { ...prev[id], quantity: qty, price: (parseFloat(defaultCost) * qty).toFixed(2) }
        }))
    }

    function toggleService(service) {
        setSelectedServices(prev => {
            if (prev[service.id]) {
                const next = { ...prev }
                delete next[service.id]
                return next
            }
            return { ...prev, [service.id]: { serviceId: service.id, inPackage: false } }
        })
    }

    function toggleMerchandise(item) {
        setSelectedMerchandise(prev => {
            if (prev[item.id]) {
                const next = { ...prev }
                delete next[item.id]
                return next
            }
            return {
                ...prev, [item.id]: {
                    merchandiseId: item.id,
                    price: item.defaultCost || '',
                    description: '',
                    quantity: item.pricingMode === 'PER_UNIT' ? 1 : null
                }
            }
        })
    }

    function toggleSpecialCharge(item) {
        setSelectedSpecialCharges(prev => {
            if (prev[item.id]) {
                const next = { ...prev }
                delete next[item.id]
                return next
            }
            return { ...prev, [item.id]: { specialChargeId: item.id, price: item.defaultCost || '', description: '' } }
        })
    }

    function toggleCashAdvance(item) {
        setSelectedCashAdvances(prev => {
            if (prev[item.id]) {
                const next = { ...prev }
                delete next[item.id]
                return next
            }
            return { ...prev, [item.id]: { cashAdvanceId: item.id, amount: '', provider: '' } }
        })
    }

    function updateCashAdvanceProvider(id, provider) {
        setSelectedCashAdvances(prev => ({
            ...prev,
            [id]: { ...prev[id], provider }
        }))
    }

    function updateCashAdvanceAmount(id, amount) {
        setSelectedCashAdvances(prev => ({
            ...prev,
            [id]: { ...prev[id], amount }
        }))
    }

    function updateMerchandisePrice(id, price) {
        setSelectedMerchandise(prev => ({
            ...prev,
            [id]: { ...prev[id], price }
        }))
    }

    function updateMerchandiseDescription(id, description) {
        setSelectedMerchandise(prev => ({
            ...prev,
            [id]: { ...prev[id], description }
        }))
    }

    function updateSpecialChargePrice(id, price) {
        setSelectedSpecialCharges(prev => ({
            ...prev,
            [id]: { ...prev[id], price }
        }))
    }

    function updateSpecialChargeDescription(id, description) {
        setSelectedSpecialCharges(prev => ({
            ...prev,
            [id]: { ...prev[id], description }
        }))
    }

    function handlePackageChange(e) {
        const id = e.target.value ? parseInt(e.target.value) : null
        setPackageId(id)
        if (!id) {
            setSelectedServices(prev => {
                const next = {}
                Object.entries(prev).forEach(([serviceId, item]) => {
                    if (!item.inPackage) {
                        next[serviceId] = item
                    }
                })
                return next
            })
        } else {
            const pkg = catalog.packages.find(p => p.id === id)
            const newSelectedServices = {}
            pkg.serviceIds.forEach(serviceId => {
                newSelectedServices[serviceId] = { serviceId, inPackage: true }
            })
            setSelectedServices(newSelectedServices)
        }
    }

    function sanitizePrice(value) {
        return (value ?? '').replace(/[^0-9.]/g, '')
    }

    function formatPrice(value) {
        const num = parseFloat(value)
        return isNaN(num) ? '' : num.toFixed(2)
    }

    useEffect(() => {
        Promise.all([getStatement(id), getCatalog()])
            .then(([statementRes, catalogRes]) => {
                setStatement(statementRes.data)
                setControlNumber(statementRes.data.controlNumber)

                const services = {}
                statementRes.data.services.forEach(s => {
                    if (!s.inPackage) {
                        services[s.serviceId] = s
                    }
                })
                if (statementRes.data.packageId) {
                    const pkg = catalogRes.data.packages.find(p => p.id === statementRes.data.packageId)
                    if (pkg) {
                        pkg.serviceIds.forEach(serviceId => {
                            services[serviceId] = { serviceId, inPackage: true }
                        })
                    }
                }
                setSelectedServices(services)
                const merchandise = {}
                statementRes.data.merchandise.forEach(m => {
                    const catalogItem = catalogRes.data.merchandise.find(cm => cm.id === m.merchandiseId)
                    const quantity = catalogItem?.pricingMode === 'PER_UNIT'
                        ? Math.round(parseFloat(m.price) / parseFloat(catalogItem.defaultCost))
                        : null
                    merchandise[m.merchandiseId] = { ...m, price: m.price?.toString() ?? '', quantity }
                })
                setSelectedMerchandise(merchandise)
                const specialCharges = {}
                statementRes.data.specialCharges.forEach(sc => {
                    specialCharges[sc.specialChargeId] = { ...sc, price: sc.price?.toString() ?? '' }
                })
                setSelectedSpecialCharges(specialCharges)
                const cashAdvances = {}
                statementRes.data.cashAdvances.forEach(ca => {
                    cashAdvances[ca.cashAdvanceId] = { ...ca, amount: ca.amount?.toString() ?? '' }
                })
                setSelectedCashAdvances(cashAdvances)
                setPackageId(statementRes.data.packageId)
                setServicesForName(statementRes.data.servicesForName)
                setServiceDate(statementRes.data.serviceDate ?? '')
                setDateOfDeath(statementRes.data.dateOfDeath ?? '')
                setPlaceOfDeath(statementRes.data.placeOfDeath)
                setCatalog(catalogRes.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load data')
                setLoading(false)
            })
    }, [id])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="page edit-statement">
            <h1>Edit Statement #{statement.controlNumber}</h1>
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
                {catalog.services.length > 0 && (
                    <div className="catalog-section">
                        <h2>Services</h2>
                        {catalog.packages.length > 0 && (
                            <div className="form-field">
                                <label htmlFor="packageId">Package</label>
                                <select id="packageId" value={packageId || ''} onChange={handlePackageChange}>
                                    <option value="">None</option>
                                    {catalog.packages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>{pkg.name} — ${pkg.defaultCost}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {catalog.services.map(service => (
                            <div key={service.id} className="catalog-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedServices[service.id]}
                                        disabled={!!selectedServices[service.id]?.inPackage}
                                        onChange={() => toggleService(service)}
                                    />
                                    {service.name}
                                </label>
                                <span className="catalog-item-price">${service.defaultCost}</span>
                            </div>
                        ))}
                    </div>
                )}

                {catalog.merchandise.length > 0 && (
                    <div className="catalog-section">
                        <h2>Merchandise</h2>
                        {catalog.merchandise.map(item => (
                            <div key={item.id} className="catalog-item catalog-item--stacked">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedMerchandise[item.id]}
                                        onChange={() => toggleMerchandise(item)}
                                    />
                                    {item.name}
                                </label>

                                {!selectedMerchandise[item.id] && item.defaultCost && (
                                    <span className="catalog-item-price">
                                        ${item.defaultCost}{item.pricingMode === 'PER_UNIT' ? ' each' : ''}
                                    </span>
                                )}
                                {selectedMerchandise[item.id] && (
                                    <div className="catalog-item-inputs">
                                        {item.pricingMode === 'PER_UNIT' ? (
                                            <>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    aria-label={`Quantity for ${item.name}`}
                                                    className="catalog-input-quantity"
                                                    value={selectedMerchandise[item.id].quantity}
                                                    onChange={e => updateMerchandiseQuantity(item.id, e.target.value, item.defaultCost)}
                                                />
                                                <span className="catalog-item-price">
                                                    ${(parseFloat(item.defaultCost) * selectedMerchandise[item.id].quantity).toFixed(2)}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                {item.requiresDescription && (
                                                    <input
                                                        type="text"
                                                        aria-label={`Description for ${item.name}`}
                                                        className="catalog-input-text"
                                                        placeholder="Description"
                                                        value={selectedMerchandise[item.id].description}
                                                        onChange={e => updateMerchandiseDescription(item.id, e.target.value)}
                                                    />
                                                )}
                                                {item.defaultCost ? (
                                                    <span className="catalog-item-price">${item.defaultCost}</span>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        aria-label={`Price for ${item.name}`}
                                                        className="catalog-input-price"
                                                        placeholder="0.00"
                                                        value={selectedMerchandise[item.id].price}
                                                        onChange={e => updateMerchandisePrice(item.id, sanitizePrice(e.target.value))}
                                                        onBlur={e => updateMerchandisePrice(item.id, formatPrice(e.target.value))}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {catalog.specialCharges.length > 0 && (
                    <div className="catalog-section">
                        <h2>Special Charges</h2>
                        {catalog.specialCharges.map(item => (
                            <div key={item.id} className="catalog-item catalog-item--stacked">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedSpecialCharges[item.id]}
                                        onChange={() => toggleSpecialCharge(item)}
                                    />
                                    {item.name}
                                </label>
                                {!selectedSpecialCharges[item.id] && item.defaultCost && (
                                    <span className="catalog-item-price">${item.defaultCost}</span>
                                )}
                                {selectedSpecialCharges[item.id] && (
                                    <div className="catalog-item-inputs">
                                        {item.requiresDescription && (
                                            <input
                                                type="text"
                                                aria-label={`Description for ${item.name}`}
                                                placeholder="Description"
                                                className="catalog-input-text"
                                                value={selectedSpecialCharges[item.id].description}
                                                onChange={e => updateSpecialChargeDescription(item.id, sanitizePrice(e.target.value))}
                                                onBlur={e => updateSpecialChargeDescription(item.id, formatPrice(e.target.value))}
                                            />
                                        )}
                                        {item.defaultCost ? (
                                            <span className="catalog-item-price">${item.defaultCost}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                aria-label={`Price for ${item.name}`}
                                                placeholder="Price"
                                                className="catalog-input-price"
                                                value={selectedSpecialCharges[item.id].price}
                                                onChange={e => updateSpecialChargePrice(item.id, sanitizePrice(e.target.value))}
                                                onBlur={e => updateSpecialChargePrice(item.id, formatPrice(e.target.value))}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {catalog.cashAdvances.length > 0 && (
                    <div className="catalog-section">
                        <h2>Cash Advances</h2>
                        {catalog.cashAdvances.map(item => (
                            <div key={item.id} className="catalog-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedCashAdvances[item.id]}
                                        onChange={() => toggleCashAdvance(item)}
                                    />
                                    {item.name}
                                </label>
                                {selectedCashAdvances[item.id] && (
                                    <div className="cash-advance-inputs">
                                        <input
                                            type="text"
                                            aria-label={`Provider for ${item.name}`}
                                            placeholder="Provider"
                                            className="catalog-input-text"
                                            value={selectedCashAdvances[item.id].provider}
                                            onChange={e => updateCashAdvanceProvider(item.id, e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            aria-label={`Amount for ${item.name}`}
                                            placeholder="Amount"
                                            className="catalog-input-price"
                                            value={selectedCashAdvances[item.id].amount}
                                            onChange={e => sanitizePrice(updateCashAdvanceAmount(item.id, e.target.value))}
                                            onBlur={e => formatPrice(updateCashAdvanceAmount(item.id, e.target.value))}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <div className="form-submit form-actions">
                    <button className="btn btn-secondary" onClick={() => navigate(`/statements/${id}`)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditStatement