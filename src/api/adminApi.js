import api from './baseApi'

export const getTenants = () => api.get('/admin/tenants')
export const getTenant = (id) => api.get(`/admin/tenants/${id}`)
export const suspendTenant = (id) => api.get(`/admin/tenants/${id}/suspend`)
export const reactivateTenant = (id) => api.get(`/admin/tenants/${id}/reactivate`)