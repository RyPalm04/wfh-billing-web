import { Link } from 'react-router-dom'
import { useState } from 'react'
import logo from '../assets/app-icon.png'
import './Nav.css'

function Nav() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav className="nav">
            <Link to="/" className="nav-brand">
                <img src={logo} alt="Wright Funeral Home Logo" />
                Wright Funeral Home
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
                <Link to="/statements" className="nav-link" onClick={() => setMenuOpen(false)}>Statements</Link>
            </div>
        </nav>
    )
}

export default Nav;