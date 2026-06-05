import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'
import AuthLayout from '../components/AuthLayout'

function Login() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { error } = await signIn(email, password)

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/statements')
        }
    }

    return (
        <AuthLayout>
            <div className="login-card">
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                    </div>
                    <div className="login-field">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p className="login=footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default Login