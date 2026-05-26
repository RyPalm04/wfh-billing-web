import { useNavigate } from "react-router-dom";
import splashLogo from '../assets/wfh splash logo.jpg'
import './Home.css'

function Home() {
    const navigate = useNavigate()

    return (
        <div className="home">
            <div className="home-hero">
                <img src={splashLogo} alt="Wright Funeral Home" className="home-logo" />
                <h1 className="home-title">Welcome to the Billing Statement Generator</h1>
                <p className="home-subtitle">Manage and generate billing statements from anywhere.</p>
                <div className="home-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/statements/new')}>New Statement</button>
                    <button className="btn btn-secondary" onClick={() => navigate('/statements')}>View Statements</button>
                </div>
            </div>
            <div className="home-steps">
                <div className="home-step">
                    <div className="home-step-number">1</div>
                    <h3 className="home-step-title">Create</h3>
                    <p className="home-step-desc">Fill out the statement form with services, merchandise, and charges.</p>
                </div>
                <div className="home-step">
                    <div className="home-step-number">2</div>
                    <h3 className="home-step-title">Review</h3>
                    <p className="home-step-desc">View the full statement detail with all totals before exporting.</p>
                </div>
                <div className="home-step">
                    <div className="home-step-number">3</div>
                    <h3 className="home-step-title">Download</h3>
                    <p className="home-step-desc">Generate a ready-to-print PDF billing statement</p>
                </div>
            </div>
        </div>
    )
}

export default Home