import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isValidEmail, EMAIL_VALIDATION_MESSAGE } from '../utils/email'
import './Auth.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isValidEmail(email.trim())) {
      setError(EMAIL_VALIDATION_MESSAGE)
      return
    }
    const result = login(email.trim(), password)
    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setError(result.error ?? 'Login failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Welcome back to your wallet</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="auth-input"
              required
              autoComplete="email"
            />
          </label>
          <label className="auth-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-input"
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit">
            Sign in
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
