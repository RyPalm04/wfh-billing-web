import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function SubscriptionInactive() {
    const { signOut } = useAuth()

    return (
        <AuthLayout>
            <p className="auth-message">Your subscription is no longer active. Please contact support to restore access.</p>
            <button className="btn btn-primary login-btn" style={{ marginTop: '24px' }} onClick={signOut}>Sign Out</button>
        </AuthLayout>
    )
}

export default SubscriptionInactive