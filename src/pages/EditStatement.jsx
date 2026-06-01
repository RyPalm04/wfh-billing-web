import { useState, useEffect } from 'react'
import { getCatalog } from '../api/catalogApi'
import { getStatement, updateStatement } from '../api/statementApi'
import { useParams, useNavigate } from 'react-router-dom'
import { displayPrice } from '../utils/price'
import { useStatementSelections } from '../hooks/useStatementSelections'
import PriceInput from '../components/PriceInput'
import toast from 'react-hot-toast'
import logger from '../utils/logger'
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
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState({})
    const [reasonForEmbalming, setReasonForEmbalming] = useState('')
    const {
      selectedServices, selectedMerchandise, selectedSpecialCharges, selectedCashAdvances, packageId,
      setSelectedServices, setSelectedMerchandise, setSelectedSpecialCharges, setSelectedCashAdvances, setPackageId,
      toggleService, toggleMerchandise, toggleSpecialCharge, toggleCashAdvance,
      updateMerchandiseQuantity, updateServiceDescription, updateServicePrice,
      updateMerchandisePrice, updateMerchandiseDescription, updateSpecialChargePrice,
      updateSpecialChargeDescription, updateCashAdvanceProvider, updateCashAdvanceAmount,
      handlePackageChange
  } = useStatementSelections(catalog)

    function handleSubmit(e) {
        logger.debug('Submitting updated statement with servicesForName:', servicesForName, 'serviceDate:', serviceDate, 'dateOfDeath:', dateOfDeath, 'placeOfDeath:', placeOfDeath, 'selectedServices:', selectedServices, 'selectedMerchandise:', selectedMerchandise, 'selectedSpecialCharges:', selectedSpecialCharges, 'selectedCashAdvances:', selectedCashAdvances, 'packageId:', packageId)
        e.preventDefault()
        setSubmitting(true)

        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            setSubmitting(false)
            return
        }
        setErrors({})

        const selectedPkg = packageId ? catalog.packages.find(p => p.id === packageId) : null

        updateStatement(id, {
            controlNumber: statement.controlNumber,
            salesTaxRate: statement.salesTaxRate,
            payment: statement.payment,
            reasonForEmbalming,
            servicesForName,
            serviceDate,
            dateOfDeath,
            placeOfDeath,
            services: Object.values(selectedServices),
            merchandise: Object.values(selectedMerchandise).map(({ quantity, ...item }) => item),
            specialCharges: Object.values(selectedSpecialCharges),
            cashAdvances: Object.values(selectedCashAdvances),
            servicePackage: selectedPkg ? {
                id: selectedPkg.id,
                sortOrder: selectedPkg.sortOrder,
                name: selectedPkg.name,
                defaultCost: selectedPkg.defaultCost,
                legacyPackage: selectedPkg.legacyPackage
            } : null,
        })
            .then(() => {
                logger.debug('Statement updated successfully, navigating to statement details page')
                toast.success('Statement updated successfully')
                setSubmitting(false)
                navigate(`/statements/${id}`)
            })
            .catch(() => {
                logger.error('Failed to save statement, id:', id)
                toast.error('Failed to save statement')
                setSubmitting(false)
            })
    }

    function validate() {
        const errors = {}

        if (embalmingSelected && !reasonForEmbalming.trim()) {
            errors.reasonForEmbalming = true
        }

        Object.entries(selectedMerchandise).forEach(([id, item]) => {
            const catalogItem = catalog.merchandise.find(m => m.id === parseInt(id))
            if (!catalogItem.defaultCost && !parseFloat(item.price)) {
                errors[`merchandise_${id}`] = true
            }
            if (catalogItem.requiresDescription && catalogItem.pricingMode !== 'PER_UNIT' && !item.description?.trim()) {
                errors[`merchandise_desc_${id}`] = true
            }
        })

        Object.entries(selectedSpecialCharges).forEach(([id, item]) => {
            const catalogItem = catalog.specialCharges.find(sc => sc.id === parseInt(id))
            if (!catalogItem.defaultCost && !parseFloat(item.price)) {
                errors[`specialCharge_${id}`] = true
            }
            if (catalogItem.requiresDescription && !item.description?.trim()) {
                errors[`specialCharge_desc_${id}`] = true
            }
        })

        Object.entries(selectedCashAdvances).forEach(([id, item]) => {
            if (!parseFloat(item.amount)) {
                errors[`cashAdvance_${id}`] = true
            }
            if (!item.provider?.trim()) {
                errors[`cashAdvance_provider_${id}`] = true
            }
        })

        return errors
    }

    useEffect(() => {
        logger.debug('Loading statement and catalog data for statement id:', id)
        Promise.all([getStatement(id), getCatalog()])
            .then(([statementRes, catalogRes]) => {
                logger.debug('Fetched statement data:', statementRes.data)
                logger.debug('Fetched catalog data:', catalogRes.data)
                setStatement(statementRes.data)
                setControlNumber(statementRes.data.controlNumber)

                const services = {}
                statementRes.data.services.forEach(s => {
                    if (!s.inPackage) {
                        logger.debug('Adding service to selected services from statement data', s.serviceId)
                        services[s.serviceId] = s
                    }
                })
                if (statementRes.data.packageId) {
                    const pkg = catalogRes.data.packages.find(p => p.id === statementRes.data.packageId)
                    if (pkg) {
                        logger.debug('Statement has package with id:', pkg.id, 'adding package services to selected services')
                        pkg.serviceIds.forEach(serviceId => {
                            const svc = catalogRes.data.services.find(s => s.id === serviceId)
                            services[serviceId] = { serviceId, inPackage: true, name: svc?.name, price: svc?.defaultCost }
                        })
                    } else {
                        logger.debug('Package is legacy, loading saved services from statement data')
                        statementRes.data.services
                            .filter(s => s.inPackage)
                            .forEach(s => { services[s.serviceId] = s })
                    }
                }
                setSelectedServices(services)
                const merchandise = {}
                statementRes.data.merchandise.forEach(m => {
                    logger.debug('Processing merchandise item from statement data', m.merchandiseId)
                    const catalogItem = catalogRes.data.merchandise.find(cm => cm.id === m.merchandiseId)
                    const quantity = catalogItem?.pricingMode === 'PER_UNIT'
                        ? Math.round(parseFloat(m.price) / parseFloat(catalogItem.defaultCost))
                        : null
                    merchandise[m.merchandiseId] = { ...m, price: m.price?.toString() ?? '', quantity }
                })
                setSelectedMerchandise(merchandise)
                const specialCharges = {}
                statementRes.data.specialCharges.forEach(sc => {
                    logger.debug('Processing special charge item from statement data', sc.specialChargeId)
                    specialCharges[sc.specialChargeId] = { ...sc, price: sc.price?.toString() ?? '' }
                })
                setSelectedSpecialCharges(specialCharges)
                const cashAdvances = {}
                statementRes.data.cashAdvances.forEach(ca => {
                    logger.debug('Processing cash advance item from statement data', ca.cashAdvanceId)
                    cashAdvances[ca.cashAdvanceId] = { ...ca, amount: ca.amount?.toString() ?? '' }
                })
                setSelectedCashAdvances(cashAdvances)
                setPackageId(statementRes.data.packageId)
                setServicesForName(statementRes.data.servicesForName)
                setServiceDate(statementRes.data.serviceDate ?? '')
                setDateOfDeath(statementRes.data.dateOfDeath ?? '')
                setPlaceOfDeath(statementRes.data.placeOfDeath)
                setReasonForEmbalming(statementRes.data.reasonForEmbalming ?? '')
                let packages = catalogRes.data.packages
                if (statementRes.data.servicePackage?.legacyPackage && statementRes.data.packageId) {
                    packages = [
                        {
                            id: statementRes.data.packageId,
                            name: statementRes.data.servicePackage.name,
                            defaultCost: statementRes.data.servicePackage.defaultCost,
                            legacyPackage: true,
                            serviceIds: statementRes.data.services.filter(s => s.inPackage).map(s => s.serviceId)
                        },
                        ...packages
                    ]
                }
                setCatalog({ ...catalogRes.data, packages })
                setLoading(false)
            })
            .catch(() => {
                logger.error('Failed to load data for statement id:', id)
                setError('Failed to load data')
                setLoading(false)
            })
    }, [id])

    const embalmingSelected = Object.values(selectedServices).some(s => s.name === 'Embalming')

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="page edit-statement">
            <h1>Edit Statement #{statement.controlNumber}</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="controlNumber" tabIndex={-1}>Control Number</label>
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
                                    {catalog.packages.map(pkg => {
                                        if (pkg.legacyPackage && packageId !== pkg.id) {
                                            return null;
                                        }
                                        return (
                                            <option key={pkg.id} value={pkg.id} disabled={pkg.legacyPackage}>
                                                {pkg.name}{pkg.legacyPackage ? ' (Legacy)' : ''} — {displayPrice(pkg.defaultCost)}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                        )}

                        {embalmingSelected && (
                            <div className="form-field">
                                <label htmlFor="reasonForEmbalming">Reason for Embalming</label>
                                <input
                                    id="reasonForEmbalming"
                                    type="text"
                                    value={reasonForEmbalming}
                                    onChange={e => setReasonForEmbalming(e.target.value)}
                                />
                                {errors.reasonForEmbalming && <div className="error">Reason for embalming is required</div>}
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
                                {!selectedServices[service.id] && service.defaultCost && (
                                    <span className="catalog-item-price">{displayPrice(service.defaultCost)}</span>
                                )}
                                {selectedServices[service.id] && (
                                    <div className="catalog-item-inputs">
                                        {service.requiresDescription && (
                                            <input
                                                type="text"
                                                aria-label={`Description for ${service.name}`}
                                                placeholder="Description"
                                                className="catalog-input-text"
                                                value={selectedServices[service.id].description}
                                                onChange={e => updateServiceDescription(service.id, e.target.value)}
                                            />
                                        )}
                                        {errors[`service_desc_${service.id}`] && <div className="error">Description required</div>}
                                        {service.defaultCost ? (
                                            <span className="catalog-item-price">{displayPrice(service.defaultCost)}</span>
                                        ) : (
                                            <PriceInput
                                                aria-label={`Price for ${service.name}`}
                                                placeholder="$0.00"
                                                value={selectedServices[service.id].price}
                                                onValueChange={e => updateServicePrice(service.id, e)}
                                            />
                                        )}
                                        {errors[`service_${service.id}`] && <div className="error">Price required</div>}
                                    </div>
                                )}
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
                                        {displayPrice(item.defaultCost)}{item.pricingMode === 'PER_UNIT' ? ' each' : ''}
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
                                                    <span className="catalog-item-price">{displayPrice(item.defaultCost)}</span>
                                                ) : (
                                                    <PriceInput
                                                        aria-label={`Price for ${item.name}`}
                                                        placeholder="$0.00"
                                                        value={selectedMerchandise[item.id].price}
                                                        onValueChange={e => updateMerchandisePrice(item.id, e)}
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
                                    <span className="catalog-item-price">{displayPrice(item.defaultCost)}</span>
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
                                                onChange={e => updateSpecialChargeDescription(item.id, e.target.value)}
                                                onBlur={e => updateSpecialChargeDescription(item.id, e.target.value)}
                                            />
                                        )}
                                        {item.defaultCost ? (
                                            <span className="catalog-item-price">{displayPrice(item.defaultCost)}</span>
                                        ) : (
                                            <PriceInput
                                                aria-label={`Price for ${item.name}`}
                                                placeholder="$0.00"
                                                value={selectedSpecialCharges[item.id].price}
                                                onValueChange={e => updateSpecialChargePrice(item.id, e)}
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
                                        <PriceInput
                                            aria-label={`Amount for ${item.name}`}
                                            placeholder="$0.00"
                                            value={selectedCashAdvances[item.id].amount}
                                            onValueChange={e => updateCashAdvanceAmount(item.id, e)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <div className="form-submit form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(`/statements/${id}`)}>
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