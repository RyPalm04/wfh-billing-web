import api from './baseApi.js'

export function submitFeedback(data) {
    return api.post("/feedback", data)
}