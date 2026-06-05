import api from './baseApi'

export function createCheckoutSession() {
    return api.post('/stripe/checkout-session')
}