import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { db, type DbTransaction } from '../db.js'
import { authMiddleware, type AuthedRequest } from '../auth.js'

export const transactionsRouter = Router()

transactionsRouter.use(authMiddleware)

function mapTransaction(row: DbTransaction) {
  return {
    id: row.id,
    userEmail: '',
    reference: row.reference,
    status: row.status,
    totalAmount: row.total_amount,
    fee: row.fee,
    netAmountCredit: row.net_amount_credit,
    createdAt: row.created_at,
    businessDescription: row.business_description,
    method: row.method ?? undefined,
    ewalletProvider: row.ewallet_provider ?? undefined,
    bankCountry: row.bank_country ?? undefined,
    bankName: row.bank_name ?? undefined,
    cryptoAsset: row.crypto_asset ?? undefined,
    walletAddress: row.wallet_address ?? undefined,
  }
}

function computeSummary(rows: DbTransaction[]) {
  let totalDeposit = 0
  let totalWithdrawal = 0
  let totalPayment = 0
  let balance = 0

  for (const row of rows) {
    if (row.business_description === 'Deposit') {
      totalDeposit += row.total_amount
      balance += row.net_amount_credit
    } else if (row.business_description === 'Withdrawal') {
      totalWithdrawal += row.total_amount
      balance -= row.net_amount_credit
    } else if (row.business_description === 'Payment') {
      totalPayment += row.total_amount
      balance -= row.net_amount_credit
    }
  }

  return {
    balance: Number(balance.toFixed(2)),
    totalDeposit: Number(totalDeposit.toFixed(2)),
    totalWithdrawal: Number(totalWithdrawal.toFixed(2)),
    totalPayment: Number(totalPayment.toFixed(2)),
  }
}

transactionsRouter.get('/', (req: AuthedRequest, res) => {
  const userId = req.user!.id
  const userEmail = req.user!.email

  const rows = db
    .prepare(
      `SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(userId) as DbTransaction[]

  const summary = computeSummary(rows)
  const transactions = rows.map((row) => ({
    ...mapTransaction(row),
    userEmail,
  }))

  res.json({ transactions, ...summary })
})

transactionsRouter.get('/:id', (req: AuthedRequest, res) => {
  const row = db
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user!.id) as DbTransaction | undefined

  if (!row) {
    res.status(404).json({ error: 'Transaction not found' })
    return
  }

  res.json({
    transaction: { ...mapTransaction(row), userEmail: req.user!.email },
  })
})

transactionsRouter.post('/', (req: AuthedRequest, res) => {
  const userId = req.user!.id
  const body = req.body as Record<string, unknown>

  const businessDescription = body.businessDescription as string | undefined
  if (!['Deposit', 'Withdrawal', 'Payment'].includes(businessDescription ?? '')) {
    res.status(400).json({ error: 'Invalid businessDescription' })
    return
  }

  const totalAmount = Number(body.totalAmount)
  const fee = Number(body.fee ?? 0)
  const netAmountCredit = Number(body.netAmountCredit)

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    res.status(400).json({ error: 'Invalid totalAmount' })
    return
  }
  if (!Number.isFinite(netAmountCredit) || netAmountCredit <= 0) {
    res.status(400).json({ error: 'Invalid netAmountCredit' })
    return
  }

  if (businessDescription !== 'Deposit') {
    const { balance } = computeSummary(
      db.prepare('SELECT * FROM transactions WHERE user_id = ?').all(userId) as DbTransaction[],
    )
    if (netAmountCredit > balance) {
      res.status(400).json({ error: 'Insufficient balance' })
      return
    }
  }

  const id = randomUUID()
  const reference = (body.reference as string) || `EW-${Date.now().toString(36).toUpperCase()}`
  const createdAt = (body.createdAt as string) || new Date().toISOString()
  const status = (body.status as string) || 'Completed'

  db.prepare(
    `INSERT INTO transactions (
      id, user_id, reference, status, total_amount, fee, net_amount_credit,
      created_at, business_description, method, ewallet_provider,
      bank_country, bank_name, crypto_asset, wallet_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    reference,
    status,
    totalAmount,
    fee,
    netAmountCredit,
    createdAt,
    businessDescription,
    (body.method as string) ?? null,
    (body.ewalletProvider as string) ?? null,
    (body.bankCountry as string) ?? null,
    (body.bankName as string) ?? null,
    (body.cryptoAsset as string) ?? null,
    (body.walletAddress as string) ?? null,
  )

  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as DbTransaction

  res.status(201).json({
    transaction: { ...mapTransaction(row), userEmail: req.user!.email },
  })
})
