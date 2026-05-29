import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'X-API-KEY': import.meta.env.VITE_API_KEY
    }
})

export function submitFeedback(data) {
    return api.post("/feedback", data)
}