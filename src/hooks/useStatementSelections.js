import { useState } from 'react'
import logger from '../utils/logger'

export function useStatementSelections(catalog) {
    const [selectedServices, setSelectedServices] = useState({})
    const [selectedMerchandise, setSelectedMerchandise] = useState({})
    const [selectedSpecialCharges, setSelectedSpecialCharges] = useState({})
    const [selectedCashAdvances, setSelectedCashAdvances] = useState({})
    const [packageId, setPackageId] = useState(null)

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

    function updateMerchandiseQuantity(id, quantity, defaultCost) {
        const qty = parseInt(quantity) || 1
        logger.debug('Updating merchandise item', id, 'quantity:', qty, 'price:', (parseFloat(defaultCost) * qty).toFixed(2)),
            setSelectedMerchandise(prev => ({
                ...prev,
                [id]: { ...prev[id], quantity: qty, price: (parseFloat(defaultCost) * qty).toFixed(2) }
            }))
    }

    function updateServiceDescription(id, description) {
        logger.debug('Updating service item', id, 'description:', description)
        setSelectedServices(prev => ({
            ...prev,
            [id]: { ...prev[id], description }
        }))
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

    function updateServicePrice(id, price) {
        logger.debug('Updating service item', id, 'price:', price)
        setSelectedServices(prev => ({
            ...prev,
            [id]: { ...prev[id], price }
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

    return {
        selectedServices, selectedMerchandise, selectedSpecialCharges, selectedCashAdvances, packageId,
        setSelectedServices, setSelectedMerchandise, setSelectedSpecialCharges, setSelectedCashAdvances, setPackageId,
        toggleService, toggleMerchandise, toggleSpecialCharge, toggleCashAdvance,
        updateMerchandiseQuantity, updateServiceDescription, updateServicePrice,
        updateMerchandisePrice, updateMerchandiseDescription, updateSpecialChargePrice,
        updateSpecialChargeDescription, updateCashAdvanceProvider, updateCashAdvanceAmount,
        handlePackageChange
    }
}