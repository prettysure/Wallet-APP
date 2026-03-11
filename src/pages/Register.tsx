import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isValidEmail, EMAIL_VALIDATION_MESSAGE } from '../utils/email'
import './Auth.css'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { user, register } = useAuth()
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
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    const result = register(name.trim(), email.trim(), password)
    if (result.ok) {
      navigate('/login', { replace: true })
    } else {
      setError(result.error ?? 'Registration failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Sign up to get your wallet</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="auth-input"
              required
              autoComplete="name"
            />
          </label>
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
              placeholder="At least 6 characters"
              className="auth-input"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label className="auth-label">
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="auth-input"
              required
              autoComplete="new-password"
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit">
            Create account
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
