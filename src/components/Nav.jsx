import { Link } from 'react-router-dom'
import logo from '../assets/app-icon.png'

function Nav() {
    return (
        <nav>
            <Link to="/">
                <img src={logo} alt="Wright Funeral Home Logo" />
                Wright Funeral Home
            </Link>
            <Link to="/statements/new">New Statement</Link>
            <Link to="/">Statements</Link>
        </nav>
    )
}

export default Nav;