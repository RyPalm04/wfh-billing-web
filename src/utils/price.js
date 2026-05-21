export function sanitizePrice(value) {
        return (value ?? '').replace(/[^0-9.]/g, '')
    }

export function formatPrice(value) {
        const num = parseFloat(value)
        return isNaN(num) ? '' : num.toFixed(2)
    }