import { Link } from 'react-router-dom'
import { useState } from 'react'
import logo from '/favicon.svg'
import './Nav.css'

function Nav() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav className="nav">
            <Link to="/" className="nav-brand">
                <img src={logo} alt="Funeral Home Statement Manager" />
                Funeral Home Statement Manager
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
            </div>
        </nav>
    )
}

export default Nav;