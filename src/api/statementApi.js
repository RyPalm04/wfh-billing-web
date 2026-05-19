import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'X-API-KEY': import.meta.env.VITE_API_KEY
    }
})

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

export function getStatementPdf(id) {
    return api.get(`/statements/${id}/pdf`, { responseType: 'blob' })
}

export default api
