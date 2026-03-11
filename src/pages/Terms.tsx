import { Link } from 'react-router-dom'
import './Legal.css'

export function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: March 2025</p>
        <p>
          By using this e-wallet app, you agree to use it in accordance with applicable laws. Use it for
          depositing money, paying bills, and withdrawing to other funding sources as intended. This
          is a demo application; do not use it for real financial transactions. We reserve the
          right to update these terms at any time.
        </p>
        <p>
          For a production app, you would include full terms of service, liability limitations, and
          dispute resolution here.
        </p>
        <Link to="/register" className="legal-back">
          ← Back to registration
        </Link>
      </div>
    </div>
  )
}
