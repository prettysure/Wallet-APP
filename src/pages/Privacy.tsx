import { Link } from 'react-router-dom'
import './Legal.css'

export function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: March 2025</p>
        <p>
          This e-wallet app collects and uses your account information (name, email, password) solely to
          provide deposit, bill payment, and withdrawal services. We do not share your data with third parties.
          Data is stored locally in your browser for this demo.
        </p>
        <p>
          For a production app, you would integrate with a backend and include full privacy
          disclosures here.
        </p>
        <Link to="/register" className="legal-back">
          ← Back to registration
        </Link>
      </div>
    </div>
  )
}
