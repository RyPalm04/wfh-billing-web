import axios from 'axios'
import { supabase } from '../supabaseClient'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

api.interceptors.request.use(async (config) => {
    const { data } = await supabase.auth.getSession()
    
    if (data.session?.access_token) {
        config.headers.Authorization = `Bearer ${data.session.access_token}`
    }

    return config
})

api.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401 && !error.config.url.includes('/version')) {
        window.location.href = '/subscription-inactive'
    }
    return Promise.reject(error)
})

export default api