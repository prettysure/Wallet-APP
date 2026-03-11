import { useAuth } from '../context/AuthContext'
import './TabPage.css'

export function MyAccount() {
  const { user, logout } = useAuth()

  return (
    <div className="tab-page">
      <header className="tab-page-header">
        <h1 className="tab-page-title">My account</h1>
        <p className="tab-page-subtitle">Profile and settings</p>
      </header>
      <section className="tab-page-content">
        <div className="account-card">
          <div className="account-row">
            <span className="account-label">Name</span>
            <span className="account-value">{user?.name}</span>
          </div>
          <div className="account-row">
            <span className="account-label">Email</span>
            <span className="account-value">{user?.email}</span>
          </div>
        </div>
        <button type="button" className="account-logout" onClick={logout}>
          Sign out
        </button>
      </section>
    </div>
  )
}
