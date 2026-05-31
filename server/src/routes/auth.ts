import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { signToken, authMiddleware, type AuthedRequest } from '../auth.js'
import { isValidEmail, EMAIL_VALIDATION_MESSAGE } from '../email.js'

export const authRouter = Router()

authRouter.post('/register', (req, res) => {
  const { name, email, password } = req.body as {
    name?: string
    email?: string
    password?: string
  }

  const trimmedName = name?.trim() ?? ''
  const trimmedEmail = email?.trim().toLowerCase() ?? ''
  const pwd = password ?? ''

  if (!trimmedName) {
    res.status(400).json({ error: 'Name is required' })
    return
  }
  if (!isValidEmail(trimmedEmail)) {
    res.status(400).json({ error: EMAIL_VALIDATION_MESSAGE })
    return
  }
  if (pwd.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail)
  if (existing) {
    res.status(409).json({
      error: 'This email is already registered. Please sign in or use a different email.',
    })
    return
  }

  const id = randomUUID()
  const passwordHash = bcrypt.hashSync(pwd, 10)
  const createdAt = new Date().toISOString()

  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(id, trimmedName, trimmedEmail, passwordHash, createdAt)

  res.status(201).json({ ok: true })
})

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  const trimmedEmail = email?.trim().toLowerCase() ?? ''
  const pwd = password ?? ''

  if (!isValidEmail(trimmedEmail)) {
    res.status(400).json({ error: EMAIL_VALIDATION_MESSAGE })
    return
  }

  const row = db
    .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
    .get(trimmedEmail) as { id: string; name: string; email: string; password_hash: string } | undefined

  if (!row || !bcrypt.compareSync(pwd, row.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = signToken(row)
  res.json({
    token,
    user: { id: row.id, name: row.name, email: row.email },
  })
})

authRouter.get('/me', authMiddleware, (req: AuthedRequest, res) => {
  const row = db
    .prepare('SELECT id, name, email FROM users WHERE id = ?')
    .get(req.user!.id) as { id: string; name: string; email: string } | undefined

  if (!row) {
    res.status(401).json({ error: 'User not found' })
    return
  }

  res.json({ user: row })
})

authRouter.post('/verify-password', authMiddleware, (req: AuthedRequest, res) => {
  const { password } = req.body as { password?: string }
  const pwd = password ?? ''

  const row = db
    .prepare('SELECT password_hash FROM users WHERE id = ?')
    .get(req.user!.id) as { password_hash: string } | undefined

  if (!row || !bcrypt.compareSync(pwd, row.password_hash)) {
    res.status(401).json({ error: 'Incorrect password' })
    return
  }

  res.json({ ok: true })
})
