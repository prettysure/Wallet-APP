import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './DepositFlowModal.css'
import { formatUsDateTime } from '../utils/date'

export interface TransferFlowResult {
  amount: number
  totalDeduction: number
  receiverId: string
  reference: string
  createdAt: string
}

interface TransferFlowModalProps {
  open: boolean
  currentBalance: number
  onClose: () => void
  onConfirm?: (result: TransferFlowResult) => void
}

function formatMoney(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return null
  return n
}

export function TransferFlowModal({ open, currentBalance, onClose, onConfirm }: TransferFlowModalProps) {
  const [amountRaw, setAmountRaw] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successResult, setSuccessResult] = useState<TransferFlowResult | null>(null)

  const amount = useMemo(() => parseAmount(amountRaw), [amountRaw])
  const totalDeduction = useMemo(() => {
    if (!amount || amount <= 0) return 0
    return Number(amount.toFixed(2))
  }, [amount])

  useEffect(() => {
    if (!open) return
    setAmountRaw('')
    setReceiverId('')
    setPassword('')
    setError('')
    setSuccessResult(null)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const submitTransfer = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!amount || amount <= 0) {
      setError('Please enter a valid transfer amount')
      return
    }
    if (totalDeduction > currentBalance) {
      setError('Transfer amount exceeds your available balance')
      return
    }
    if (!receiverId.trim()) {
      setError('Please enter the receiver wallet ID')
      return
    }
    if (!/^\d{6}$/.test(password.trim())) {
      setError('Transfer password must be 6 digits')
      return
    }

    const reference = `TF-${Date.now().toString(36).toUpperCase()}`
    const createdAt = new Date().toISOString()

    const result: TransferFlowResult = {
      amount,
      totalDeduction,
      receiverId: receiverId.trim(),
      reference,
      createdAt,
    }

    onConfirm?.(result)
    setSuccessResult(result)
  }

  if (!open) return null

  return (
    <div className="dfm-overlay" onClick={onClose} role="presentation">
      <div className="dfm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dfm-header">
          <div>
            <h2 className="dfm-title">Transfer</h2>
            <p className="dfm-subtitle">Send money to another wallet account ID</p>
          </div>
          <button type="button" className="dfm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {!successResult && (
          <form onSubmit={submitTransfer} className="dfm-body">
            <label className="dfm-label">
              Receiver wallet ID
              <input
                className="dfm-input"
                placeholder="Enter receiver wallet ID"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                autoFocus
              />
            </label>

            <label className="dfm-label">
              Amount to transfer
              <input
                className="dfm-input"
                inputMode="decimal"
                placeholder="e.g. 50.00"
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value)}
              />
            </label>

            <label className="dfm-label">
              Transfer password (6 digits)
              <input
                className="dfm-input"
                type="password"
                inputMode="numeric"
                placeholder="Enter 6-digit password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <div className="dfm-summary">
              <div className="dfm-row">
                <span className="dfm-row-label">Available balance</span>
                <span className="dfm-row-value">{formatMoney(currentBalance)}</span>
              </div>
              <div className="dfm-row">
                <span className="dfm-row-label">Total amount deducted</span>
                <span className="dfm-row-value dfm-row-value--net">-{formatMoney(totalDeduction)}</span>
              </div>
            </div>

            {error && <p className="dfm-error">{error}</p>}

            <div className="dfm-actions">
              <button type="button" className="dfm-btn dfm-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="dfm-btn dfm-btn-primary" disabled={currentBalance <= 0}>
                Confirm transfer
              </button>
            </div>
          </form>
        )}

        {successResult && (
          <div className="dfm-body">
            <div className="dfm-success">
              <div className="dfm-success-icon">✓</div>
              <h3 className="dfm-success-title">Transfer successful</h3>
              <p className="dfm-success-subtitle">Your transfer has been submitted.</p>

              <div className="dfm-summary">
                <div className="dfm-row">
                  <span className="dfm-row-label">Reference no.</span>
                  <span className="dfm-row-value">{successResult.reference}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Amount</span>
                  <span className="dfm-row-value">{formatMoney(successResult.amount)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Total deducted</span>
                  <span className="dfm-row-value dfm-row-value--net">-{formatMoney(successResult.totalDeduction)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Receiver wallet ID</span>
                  <span className="dfm-row-value">{successResult.receiverId}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Date</span>
                  <span className="dfm-row-value">{formatUsDateTime(successResult.createdAt)}</span>
                </div>
              </div>

              <div className="dfm-actions dfm-actions--single">
                <button
                  type="button"
                  className="dfm-btn dfm-btn-primary"
                  onClick={() => {
                    onClose()
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

