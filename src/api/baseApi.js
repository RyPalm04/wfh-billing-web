import axios from 'axios'
import { supabase } from './supabaseClient'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

api.interceptors.request.use(async (config) => {
    const { data } = await supbase.auth.getSession()
    
    if (data.session?.access_token) {
        config.headers.Authorization = `Bearer ${data.session.access_token}`
    }

    return config
})

export default api