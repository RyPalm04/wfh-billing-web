import { Link } from 'react-router-dom'
import logo from '../assets/app-icon.png'
import './Nav.css'

function Nav() {
    return (
        <nav className="nav">
            <Link to="/" className="nav-brand">
                <img src={logo} alt="Wright Funeral Home Logo" />
                Wright Funeral Home
            </Link>
            <div className="nav-actions">
                <Link to="/statements/new" className="nav-link">New Statement</Link>
                <Link to="/statements" className="nav-link">Statements</Link>
            </div>
        </nav>
    )
}

export default Nav;