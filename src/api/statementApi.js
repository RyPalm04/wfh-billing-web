import api from './baseApi.js'

export function getStatements() {
    return api.get('/statements')
}

export function getStatement(id) {
    return api.get(`/statements/${id}`)
}

export function getNextControlNumber() {
    return api.get('/statements/next-control-number')
}

export function createStatement(statement) {
    return api.post('/statements', statement)
}

export function updateStatement(id, statement) {
    return api.put(`/statements/${id}`, statement)
}

export function getStatementPdf(id) {
    return api.get(`/statements/${id}/pdf`, { responseType: 'blob' })
}
