import { useEffect, useState } from "react"
import { createCheckoutSession } from "../api/stripeApi"
import './Login.css'
import AuthLayout from "../components/AuthLayout"

function Checkout() {
    const [error, setError] = useState(null)

    useEffect(() => {
        createCheckoutSession()
        .then(res => { 
            console.log(res.data)
            window.location.href = res.data.url })
        .catch((err) => {
            console.error('Checkout error:', err)
            setError('Unable to start checkout. Please try again or contact support.')
    })
    }, [])

    if (error) {
        return (
            <AuthLayout>
                <p className="auth-message">{error}</p>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <p className="auth-message">Redirecting to checkout...</p>
        </AuthLayout>
    )
}

export default Checkout