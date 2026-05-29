import api from "./api";

export function submitFeedback(data) {
    return api.post("/feedback", data)
}