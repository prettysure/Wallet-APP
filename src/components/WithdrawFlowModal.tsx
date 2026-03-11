import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './DepositFlowModal.css'
import { formatUsDateTime } from '../utils/date'

type Step = 'amount' | 'method' | 'password' | 'success'
type WithdrawMethod = 'paypal' | 'tron'

export interface WithdrawFlowResult {
  amount: number
  fee: number
  totalDeduction: number
  method: WithdrawMethod
  walletAddress?: string
  reference: string
  createdAt: string
}

interface WithdrawFlowModalProps {
  open: boolean
  currentBalance: number
  onClose: () => void
  onConfirm?: (result: WithdrawFlowResult) => void
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

export function WithdrawFlowModal({ open, currentBalance, onClose, onConfirm }: WithdrawFlowModalProps) {
  const [step, setStep] = useState<Step>('amount')
  const [amountRaw, setAmountRaw] = useState('')
  const [method, setMethod] = useState<WithdrawMethod>('paypal')
  const [walletAddress, setWalletAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successResult, setSuccessResult] = useState<WithdrawFlowResult | null>(null)

  const amount = useMemo(() => parseAmount(amountRaw), [amountRaw])
  const fee = useMemo(() => {
    if (!amount || amount <= 0) return 0
    const calculated = amount * 0.01 + 0.25 // 1% + $0.25, capped at $10
    return Math.min(10, Number(calculated.toFixed(2)))
  }, [amount])

  const totalDeduction = useMemo(() => {
    if (!amount || amount <= 0) return 0
    return Number((amount + fee).toFixed(2))
  }, [amount, fee])

  useEffect(() => {
    if (!open) return
    setStep('amount')
    setAmountRaw('')
    setMethod('paypal')
    setWalletAddress('')
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

  useEffect(() => {
    if (!open) return
    setError('')
    setWalletAddress('')
    setPassword('')
  }, [method, open])

  const goNext = () => {
    setError('')
    if (!amount || amount <= 0) {
      setError('Please enter a valid withdrawal amount')
      return
    }
    if (totalDeduction <= 0) {
      setError('Total deduction must be greater than $0.00')
      return
    }
    if (totalDeduction > currentBalance) {
      setError('Withdrawal amount exceeds your available balance')
      return
    }
    setStep('method')
  }

  const goToPassword = () => {
    setError('')
    if (!amount || amount <= 0) {
      setError('Please enter a valid withdrawal amount')
      setStep('amount')
      return
    }
    if (totalDeduction > currentBalance) {
      setError('Withdrawal amount exceeds your available balance')
      setStep('amount')
      return
    }
    if (method === 'tron') {
      if (!walletAddress.trim()) {
        setError('Please enter your TRON wallet address')
        return
      }
    }
    setStep('password')
  }

  const submitPassword = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!amount || amount <= 0) {
      setError('Please enter a valid withdrawal amount')
      setStep('amount')
      return
    }
    if (totalDeduction > currentBalance) {
      setError('Withdrawal amount exceeds your available balance')
      setStep('amount')
      return
    }
    if (!/^\d{6}$/.test(password.trim())) {
      setError('Withdrawal password must be 6 digits')
      return
    }

    const reference = `WD-${Date.now().toString(36).toUpperCase()}`
    const createdAt = new Date().toISOString()

    const result: WithdrawFlowResult = {
      amount,
      fee,
      totalDeduction,
      method,
      walletAddress: method === 'tron' ? walletAddress.trim() : undefined,
      reference,
      createdAt,
    }

    onConfirm?.(result)
    setSuccessResult(result)
    setStep('success')
  }

  if (!open) return null

  return (
    <div className="dfm-overlay" onClick={onClose} role="presentation">
      <div className="dfm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dfm-header">
          <div>
            <h2 className="dfm-title">Withdraw</h2>
            <p className="dfm-subtitle">
              {step === 'amount' ? 'Enter amount and review fee' : step === 'method' ? 'Select funding source' : 'Confirm withdrawal password'}
            </p>
          </div>
          <button type="button" className="dfm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={submitPassword} className="dfm-body">
          {step === 'amount' && (
            <>
              <label className="dfm-label">
                Withdraw amount
                <input
                  className="dfm-input"
                  inputMode="decimal"
                  placeholder="e.g. 100.00"
                  value={amountRaw}
                  onChange={(e) => setAmountRaw(e.target.value)}
                  autoFocus
                />
              </label>

              <div className="dfm-summary">
                <div className="dfm-row">
                  <span className="dfm-row-label">Available balance</span>
                  <span className="dfm-row-value">{formatMoney(currentBalance)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Withdrawal fee</span>
                  <span className="dfm-row-value">{formatMoney(fee)}</span>
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
                <button type="button" className="dfm-btn dfm-btn-primary" onClick={goNext} disabled={currentBalance <= 0}>
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 'method' && (
            <>
              <div className="dfm-summary">
                <div className="dfm-row">
                  <span className="dfm-row-label">Withdraw amount</span>
                  <span className="dfm-row-value">{formatMoney(amount ?? 0)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Fee</span>
                  <span className="dfm-row-value">{formatMoney(fee)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Total deducted</span>
                  <span className="dfm-row-value dfm-row-value--net">-{formatMoney(totalDeduction)}</span>
                </div>
              </div>

              <div className="dfm-methods">
                <label className={`dfm-method ${method === 'paypal' ? 'dfm-method--active' : ''}`}>
                  <input type="radio" name="method" checked={method === 'paypal'} onChange={() => setMethod('paypal')} />
                  <div>
                    <div className="dfm-method-title">Withdraw to PayPal</div>
                    <div className="dfm-method-desc">Send funds to your PayPal account</div>
                  </div>
                </label>

                <label className={`dfm-method ${method === 'tron' ? 'dfm-method--active' : ''}`}>
                  <input type="radio" name="method" checked={method === 'tron'} onChange={() => setMethod('tron')} />
                  <div>
                    <div className="dfm-method-title">Withdraw to TRON address</div>
                    <div className="dfm-method-desc">Send to a Web3 wallet (TRON)</div>
                  </div>
                </label>
              </div>

              {method === 'tron' && (
                <div className="dfm-panel">
                  <label className="dfm-label">
                    TRON wallet address
                    <input
                      className="dfm-input"
                      placeholder="Enter TRON wallet address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                  </label>
                </div>
              )}

              {error && <p className="dfm-error">{error}</p>}

              <div className="dfm-actions">
                <button type="button" className="dfm-btn dfm-btn-secondary" onClick={() => setStep('amount')}>
                  Back
                </button>
                <button type="button" className="dfm-btn dfm-btn-primary" onClick={goToPassword}>
                  Confirm withdrawal
                </button>
              </div>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="dfm-summary">
                <div className="dfm-row">
                  <span className="dfm-row-label">Withdraw amount</span>
                  <span className="dfm-row-value">{formatMoney(amount ?? 0)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Fee</span>
                  <span className="dfm-row-value">{formatMoney(fee)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Total deducted</span>
                  <span className="dfm-row-value dfm-row-value--net">-{formatMoney(totalDeduction)}</span>
                </div>
              </div>

              <label className="dfm-label">
                Withdrawal password (6 digits)
                <input
                  className="dfm-input"
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter 6-digit password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </label>

              {error && <p className="dfm-error">{error}</p>}

              <div className="dfm-actions">
                <button type="button" className="dfm-btn dfm-btn-secondary" onClick={() => setStep('method')}>
                  Back
                </button>
                <button type="submit" className="dfm-btn dfm-btn-primary">
                  Confirm password
                </button>
              </div>
            </>
          )}

          {step === 'success' && successResult && (
            <div className="dfm-success">
              <div className="dfm-success-icon">✓</div>
              <h3 className="dfm-success-title">Withdrawal successful</h3>
              <p className="dfm-success-subtitle">Your withdrawal request has been submitted.</p>

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
                  <span className="dfm-row-label">Fee</span>
                  <span className="dfm-row-value">{formatMoney(successResult.fee)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Total deducted</span>
                  <span className="dfm-row-value dfm-row-value--net">-{formatMoney(successResult.totalDeduction)}</span>
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
          )}
        </form>
      </div>
    </div>
  )
}

