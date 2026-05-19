import api from './statementApi'

export function getCatalog() {
    return api.get('/catalog')
}