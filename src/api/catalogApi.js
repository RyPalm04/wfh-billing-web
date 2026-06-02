import api from './baseApi.js'

export function getCatalog() {
    return api.get('/catalog')
}