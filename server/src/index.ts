import express from 'express'
import cors from 'cors'
import './db.js'
import { authRouter } from './routes/auth.js'
import { transactionsRouter } from './routes/transactions.js'

const app = express()
const port = Number(process.env.PORT ?? 3001)

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,https://wallet-app-s9io.vercel.app')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'wallet-app-api' })
})

app.use('/api/auth', authRouter)
app.use('/api/transactions', transactionsRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Wallet API listening on http://0.0.0.0:${port}`)
})
