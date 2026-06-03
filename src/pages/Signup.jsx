import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Login.css'

function Signup() {
    const [funeralHomeName, setFuneralHomeName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [confirmed, setConfirmed] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { funeral_home_name: funeralHomeName } }
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setConfirmed(true)
        }
    }

    if (confirmed) {
        return (
            <div className="login-wrapper">
                <h1 className="login-title">Eternatel</h1>
                <p className="login-subtitle">Deathcare CMS</p>
                <p style={{ marginTop: '24px', color: 'var(--secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                    Check your email to confirm your account before signing in.
                </p>
                <p style={{ marginTop: '16px', fontSize: '13px' }}>
                    <Link to="/login" style={{ color: 'var(--green)', fontWeight: '700', textDecoration: 'none' }}>Back to sign in</Link>
                </p>
            </div>
        )
    }

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h1 className="login-title">Eternatel</h1>
                <p className="login-subtitle">Deathcare CMS</p>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label htmlFor="funeralHomeName">Funeral Home Name</label>
                        <input
                            id="funeralHomeName"
                            type="text"
                            value={funeralHomeName}
                            onChange={e => setFuneralHomeName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                <p className="login-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    )
}

export default Signup