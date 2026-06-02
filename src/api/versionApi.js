import api from './baseApi'

export function getApiVersion() {
    return api.get('/version')
}