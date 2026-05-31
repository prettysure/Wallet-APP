import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { DbUser } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-change-me-in-production'

export interface AuthPayload {
  sub: string
  email: string
}

export interface AuthedRequest extends Request {
  user?: Pick<DbUser, 'id' | 'name' | 'email'>
}

export function signToken(user: Pick<DbUser, 'id' | 'email'>): string {
  const payload: AuthPayload = { sub: user.id, email: user.email }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const token = header.slice('Bearer '.length)
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload
    req.user = { id: payload.sub, email: payload.email, name: '' }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
