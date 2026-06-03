import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MdSettings } from 'react-icons/md'
import logo from '/favicon.svg'
import './Nav.css'
import { supabase } from '../supabaseClient'

function Nav() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [session, setSession] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe
    }, [])

    async function logout() {
        console.log("User signed out")
        await supabase.auth.signOut()
    }

    return (
        <nav className="nav">
            <Link to="/" className="nav-brand">
                <img src={logo} alt="Funeral Home Statement Manager" />
                <span className="nav-brand-text">
                    Funeral Home Statement Manager
                </span>
            </Link>
            <button
                className={`nav-hamburger ${menuOpen ? 'nav-hamburger--open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation"
                aria-expanded={menuOpen}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div className={`nav-actions ${menuOpen ? 'nav-actions--open' : ''}`}>
                <Link to="/statements/new" className="nav-link" onClick={() => setMenuOpen(false)}>New Statement</Link>
                <Link to="/statements" className="nav-link" onClick={() => setMenuOpen(false)}>View Statements</Link>
                <Link to="/settings" className="nav-link nav-link--icon" onClick={() => setMenuOpen(false)}>
                    <MdSettings size={18} />
                    Settings
                </Link>
                {session
                    ? <Link to="/login" className="nav-link" onClick={() => logout()}>Logout</Link>
                    : <Link to="/login" className="nav-link">Login</Link>
                }
            </div>
        </nav>
    )
}

export default Nav;