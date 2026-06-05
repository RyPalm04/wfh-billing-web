import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AuthLayout from '../components/AuthLayout'

function CheckoutSuccess() {
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        let poll

        const timeout = setTimeout(() => {
            clearInterval(poll)
            navigate('/statements/', { replace: true})
        }, 30000)

        poll = setInterval(async () => {
            const { data } = await supabase.auth.refreshSession()
            if (data.session?.user?.app_metadata?.tenant_id) {
                clearTimeout(timeout)
                clearInterval(poll)
                navigate('/statements', { replace: true })
            }
        }, 2000)

        return () => {
            clearInterval(poll)
            clearTimeout(timeout)
        }
    }, [navigate])

    return (
        <AuthLayout>
            <p className="auth-message">Setting up your account...</p>
        </AuthLayout>
    )
}

export default CheckoutSuccess