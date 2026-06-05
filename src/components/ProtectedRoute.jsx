import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute() {
    const { session, loading } = useAuth()

    if (loading) {
        return null
    }

    if (!session) {
        return <Navigate to="/login" replace />
    }  

    if (!session.user?.app_metadata?.tenant_id) {
        return <Navigate to="/checkout" replace />
    }

    return <Outlet />
}

export default ProtectedRoute