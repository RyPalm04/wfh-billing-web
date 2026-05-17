import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'X-API-KEY': import.meta.env.VITE_API_KEY
    }
})

export default api