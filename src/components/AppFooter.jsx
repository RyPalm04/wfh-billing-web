import { useState, useEffect } from 'react'
import { getApiVersion } from '../api/versionApi'
import './AppFooter.css'

function AppFooter() {
    const [apiVersion, setApiVersion] = useState(null)

    useEffect(() => {
        getApiVersion()
            .then(response => { setApiVersion(response.data) })
            .catch(error => setApiVersion("unknown"))
    }, [])

    return (
        <footer className="app-footer">
            <span className="copyright-label">© {new Date().getFullYear()} Ryan Palmer. All right reserved.</span>
            <span className="version-label">Web Version: v{__APP_VERSION__}{apiVersion ? ` | API Version: v${apiVersion}` : ''}</span>
        </footer>
    )
}

export default AppFooter;