import '../pages/Login.css'

function AuthLayout({ children }) {
    return (
        <div className="login-wrapper">
            <h1 className="login-title">Eternatel</h1>
            <p className="login-subtitle">Deathcare CMS</p>
            {children}
        </div>
    )
}

export default AuthLayout