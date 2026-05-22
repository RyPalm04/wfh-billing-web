import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCatalog } from '../api/catalogApi'
import { createStatement, getNextControlNumber } from '../api/statementApi'
import { sanitizePrice, formatPrice } from '../utils/price'
import Shepherd from 'shepherd.js'
import toast from 'react-hot-toast'
import logger from '../utils/logger'
import 'shepherd.js/dist/css/shepherd.css'
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
    const [selectedServices, setSelectedServices] = useState({})
    const [selectedMerchandise, setSelectedMerchandise] = useState({})
    const [selectedSpecialCharges, setSelectedSpecialCharges] = useState({})
    const [selectedCashAdvances, setSelectedCashAdvances] = useState({})
    const [packageId, setPackageId] = useState(null)
    const [reasonForEmbalming, setReasonForEmbalming] = useState('')
    const [errors, setErrors] = useState({})
    const navigate = useNavigate()

    function startTour() {
        logger.debug('Starting new statement creation tour')
        const tour = new Shepherd.Tour({
            defaultStepOptions: {
                cancelIcon: {
                    enabled: true,
                    label: 'Close Tour'
                },
                modalOverlayOpeningPadding: 12,
                modalOverlayOpeningRadius: 4,
                scrollTo: { behavior: 'smooth', block: 'center', inline: 'center' }
            },
            useModalOverlay: true
        })
        tour.addSteps([
            {
                id: 'intro',
                text: 'Welcome! This guide will walk you through creating a statement.',
                buttons: [{ text: 'Next', action: () => tour.next() }]
            },
            {
                id: 'services',
                text: 'Select the services provided. You can choose a package or individual services.',
                attachTo: { element: '#services-section', on: 'bottom' },
                buttons: [
                    { text: 'Back', action: () => tour.back() },
                    { text: 'Next', action: () => tour.next() }
                ]
            },
            {
                id: 'merchandise',
                text: 'Add any merchandise items. Items with no default price require you to enter one.',
                attachTo: { element: '#merchandise-section', on: 'bottom' },
                buttons: [
                    { text: 'Back', action: () => tour.back() },
                    { text: 'Next', action: () => tour.next() }
                ]
            },
            {
                id: 'cash-advances',
                text: 'Cash advances are payments made on behalf of the family. Enter the provider and amount.',
                attachTo: { element: '#cash-advances-section', on: 'bottom' },
                buttons: [
                    { text: 'Back', action: () => tour.back() },
                    { text: 'Done', action: () => tour.complete() }
                ]
            }
        ])
        localStorage.setItem('tourSeen', 'true')
        tour.start()
    }

    useEffect(() => {
        logger.debug('NewStatement component mounted, loading catalog and next control number')
        if (!loading && !localStorage.getItem('tourSeen')) {
            startTour()
        }
    }, [loading])

    useEffect(() => {
        logger.debug('Fetching catalog and next control number for new statement form')
        Promise.all([getCatalog(), getNextControlNumber()])
            .then(([catalogResponse, controlNumberResponse]) => {
                logger.debug('Fetched catalog:', catalogResponse.data)
                logger.debug('Fetched next control number:', controlNumberResponse.data)
                setCatalog(catalogResponse.data)
                setControlNumber(controlNumberResponse.data)
                setLoading(false)
            })
            .catch((error) => {
                logger.error('Error fetching data:', error)
                setError('Failed to load catalog')
                setLoading(false)
            })
    }, [])

    function handleSubmit(e) {
        e.preventDefault()
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            logger.debug('Validation errors:', validationErrors)
            setErrors(validationErrors)
            return
        }
        setErrors({})
        setSubmitting(true)
        const selectedPackage = packageId ? catalog.packages.find(p => p.id === packageId) : null

        createStatement({
            controlNumber, servicesForName, serviceDate, dateOfDeath, placeOfDeath, reasonForEmbalming,
            packageId,
            packageName: selectedPackage?.name ?? null,
            packagePrice: selectedPackage?.defaultCost ?? null,
            services: Object.values(selectedServices),
            merchandise: Object.values(selectedMerchandise).map(({ quantity, ...item }) => item),
            specialCharges: Object.values(selectedSpecialCharges),
            cashAdvances: Object.values(selectedCashAdvances)
        })
            .then(() => {
                logger.debug('Statement created successfully')
                navigate('/statements')
            })
            .catch(error => {
                logger.error('Error creating statement:', error)
                toast.error('Failed to create statement')
                setSubmitting(false)
            })
    }

    function updateMerchandiseQuantity(id, quantity, defaultCost) {
        const qty = parseInt(quantity) || 1
        logger.debug('Updating merchandise item', id, 'quantity:', qty, 'price:', (parseFloat(defaultCost) * qty).toFixed(2)),
            setSelectedMerchandise(prev => ({
                ...prev,
                [id]: { ...prev[id], quantity: qty, price: (parseFloat(defaultCost) * qty).toFixed(2) }
            }))
    }

    function toggleService(service) {
        setSelectedServices(prev => {
            logger.debug('Toggling service', service.id, 'current selection:', !!prev[service.id])
            if (prev[service.id]) {
                logger.debug('Removing service', service.id, 'from selection')
                const next = { ...prev }
                delete next[service.id]
                return next
            }
            logger.debug('Adding service', service.id, 'to selection')
            return { ...prev, [service.id]: { serviceId: service.id, inPackage: false, name: service.name, price: service.defaultCost } }
        })
    }

    function toggleMerchandise(item) {
        setSelectedMerchandise(prev => {
            logger.debug('Toggling merchandise item', item.id, 'current selection:', !!prev[item.id])
            if (prev[item.id]) {
                logger.debug('Removing merchandise item', item.id, 'from selection')
                const next = { ...prev }
                delete next[item.id]
                return next
            }
            logger.debug('Adding merchandise item', item.id, 'to selection with default price:', item.defaultCost)
            return {
                ...prev, [item.id]: {
                    name: item.name,
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
            logger.debug('Toggling special charge item', item.id, 'current selection:', !!prev[item.id])
            if (prev[item.id]) {
                logger.debug('Removing special charge item', item.id, 'from selection')
                const next = { ...prev }
                delete next[item.id]
                return next
            }
            logger.debug('Adding special charge item', item.id, 'to selection with default price:', item.defaultCost)
            return { ...prev, [item.id]: { name: item.name, specialChargeId: item.id, price: item.defaultCost || '', description: '' } }
        })
    }

    function toggleCashAdvance(item) {
        setSelectedCashAdvances(prev => {
            logger.debug('Toggling cash advance item', item.id, 'current selection:', !!prev[item.id])
            if (prev[item.id]) {
                logger.debug('Removing cash advance item', item.id, 'from selection')
                const next = { ...prev }
                delete next[item.id]
                return next
            }
            logger.debug('Adding cash advance item', item.id, 'to selection')
            return { ...prev, [item.id]: { name: item.name, cashAdvanceId: item.id, amount: '', provider: '' } }
        })
    }

    function updateCashAdvanceProvider(id, provider) {
        logger.debug('Updating cash advance item', id, 'provider:', provider)
        setSelectedCashAdvances(prev => ({
            ...prev,
            [id]: { ...prev[id], provider }
        }))
    }

    function updateCashAdvanceAmount(id, amount) {
        logger.debug('Updating cash advance item', id, 'amount:', amount)
        setSelectedCashAdvances(prev => ({
            ...prev,
            [id]: { ...prev[id], amount }
        }))
    }

    function updateMerchandisePrice(id, price) {
        logger.debug('Updating merchandise item', id, 'price:', price)
        setSelectedMerchandise(prev => ({
            ...prev,
            [id]: { ...prev[id], price }
        }))
    }

    function updateMerchandiseDescription(id, description) {
        logger.debug('Updating merchandise item', id, 'description:', description)
        setSelectedMerchandise(prev => ({
            ...prev,
            [id]: { ...prev[id], description }
        }))
    }

    function updateSpecialChargePrice(id, price) {
        logger.debug('Updating special charge item', id, 'price:', price)
        setSelectedSpecialCharges(prev => ({
            ...prev,
            [id]: { ...prev[id], price }
        }))
    }

    function updateSpecialChargeDescription(id, description) {
        logger.debug('Updating special charge item', id, 'description:', description)
        setSelectedSpecialCharges(prev => ({
            ...prev,
            [id]: { ...prev[id], description }
        }))
    }

    function handlePackageChange(e) {
        logger.debug('Handling package change', e.target.value)
        const id = e.target.value ? parseInt(e.target.value) : null
        setPackageId(id)
        if (!id) {
            logger.debug('No package selected, clearing package services from selection')
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
            logger.debug('Package selected with id', id, 'adding package services to selection')
            const pkg = catalog.packages.find(p => p.id === id)
            const newSelectedServices = {}
            pkg.serviceIds.forEach(serviceId => {
                const svc = catalog.services.find(s => s.id === serviceId)
                newSelectedServices[serviceId] = { serviceId, inPackage: true, name: svc?.name, price: svc?.defaultCost }
            })
            setSelectedServices(newSelectedServices)
        }
    }

    function validate() {
        logger.debug('Validating statement form with selected merchandise, special charges, and cash advances')
        const errors = {}

        Object.entries(selectedMerchandise).forEach(([id, item]) => {
            const catalogItem = catalog.merchandise.find(m => m.id === parseInt(id))
            logger.debug('Validating merchandise item', id)
            if (!catalogItem.defaultCost && !parseFloat(item.price)) {
                logger.debug('Validation error for merchandise item', id, 'price is required')
                errors[`merchandise_${id}`] = true
            }
            if (catalogItem.requiresDescription && catalogItem.pricingMode !== 'PER_UNIT' && !item.description?.trim()) {
                logger.debug('Validation error for merchandise item', id, 'description is required')
                errors[`merchandise_desc_${id}`] = true
            }
        })

        Object.entries(selectedSpecialCharges).forEach(([id, item]) => {
            logger.debug('Validating special charge item', id)
            const catalogItem = catalog.specialCharges.find(sc => sc.id === parseInt(id))
            if (!catalogItem.defaultCost && !parseFloat(item.price)) {
                logger.debug('Validation error for special charge item', id, 'price is required')
                errors[`specialCharge_${id}`] = true
            }
            if (catalogItem.requiresDescription && !item.description?.trim()) {
                logger.debug('Validation error for special charge item', id, 'description is required')
                errors[`specialCharge_desc_${id}`] = true
            }
        })

        Object.entries(selectedCashAdvances).forEach(([id, item]) => {
            logger.debug('Validating cash advance item', id)
            if (!parseFloat(item.amount)) {
                logger.debug('Validation error for cash advance item', id, 'amount is required')
                errors[`cashAdvance_${id}`] = true
            }
            if (!item.provider?.trim()) {
                logger.debug('Validation error for cash advance item', id, 'provider is required')
                errors[`cashAdvance_provider_${id}`] = true
            }
        })

        logger.debug('Validation completed with errors:', errors)
        return errors
    }

    if (loading) {
        return <div className="page">Loading...</div>
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <div className="page new-statement">
            <div className="page-header">
                <h1>New Statement</h1>
                <button type="button" className="btn btn-secondary" onClick={() => { localStorage.removeItem('tourSeen'); startTour() }}>Restart Tour</button>
            </div>
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
                    <div className="catalog-section" id="services-section">
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
                    <div className="catalog-section" id="merchandise-section">
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
                                                {errors[`merchandise_desc_${item.id}`] && <div className="error">Description required</div>}
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
                                                {errors[`merchandise_${item.id}`] && <div className="error">Price required</div>}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {catalog.specialCharges.length > 0 && (
                    <div className="catalog-section" id="special-charges-section">
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
                                        {errors[`specialCharge_desc_${item.id}`] && <div className="error">Description required</div>}
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
                                        {errors[`specialCharge_${item.id}`] && <div className="error">Price required</div>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {catalog.cashAdvances.length > 0 && (
                    <div className="catalog-section" id="cash-advances-section">
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
                                        {errors[`cashAdvance_provider_${item.id}`] && <div className="error">Provider required</div>}
                                        <input
                                            type="text"
                                            aria-label={`Amount for ${item.name}`}
                                            placeholder="Amount"
                                            className="catalog-input-price"
                                            value={selectedCashAdvances[item.id].amount}
                                            onChange={e => sanitizePrice(updateCashAdvanceAmount(item.id, e.target.value))}
                                            onBlur={e => formatPrice(updateCashAdvanceAmount(item.id, e.target.value))}
                                        />
                                        {errors[`cashAdvance_${item.id}`] && <div className="error">Amount required</div>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <div className="form-submit form-actions">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>Create Statement</button>
                </div>
            </form>
        </div>
    )
}

export default NewStatement;