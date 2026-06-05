import api from './baseApi'

export function getLicenseKey() {
    return api.get('/desktop/license-key')
}

export function generateLicenseKey() {
    return api.post('/desktop/license-key')
}