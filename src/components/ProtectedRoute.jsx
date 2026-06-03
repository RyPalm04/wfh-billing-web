import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute() {
    const { session, loading } = useAuth()

    if (loading) {
        return null
    }

    return session ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute