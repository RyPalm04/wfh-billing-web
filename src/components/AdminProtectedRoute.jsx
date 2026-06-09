import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminProtectedRoute() {
    const { session, loading} = useAuth()

    if (loading) {
        return null
    }

    if (!session) {
        return <Navigate to="/login" replace />
    }

    if (session.user?.app_metadata?.app_role !== 'platform_manager') {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default AdminProtectedRoute