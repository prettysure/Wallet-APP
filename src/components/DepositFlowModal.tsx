import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './DepositFlowModal.css'
import { formatUsDateTime } from '../utils/date'

type Step = 'amount' | 'method' | 'password' | 'success'
type Method = 'ewallet' | 'bank' | 'crypto'
type EWalletProvider = 'paypal' | 'gpay'
type BankCountry = 'us' | 'uk' | 'sg'
type CryptoAsset = 'tron-usdt' | 'tron-usdc'

export interface DepositFlowResult {
  amount: number
  fee: number
  netAmount: number
  method: Method
  ewalletProvider?: EWalletProvider
  bankCountry?: BankCountry
  bankName?: string
  cryptoAsset?: CryptoAsset
  reference: string
  createdAt: string
}

interface DepositFlowModalProps {
  open: boolean
  onClose: () => void
  onConfirm?: (result: DepositFlowResult) => void
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

export function DepositFlowModal({ open, onClose, onConfirm }: DepositFlowModalProps) {
  const [step, setStep] = useState<Step>('amount')
  const [amountRaw, setAmountRaw] = useState('')
  const [method, setMethod] = useState<Method>('ewallet')
  const [error, setError] = useState('')
  const [ewalletProvider, setEwalletProvider] = useState<EWalletProvider | ''>('')
  const [bankCountry, setBankCountry] = useState<BankCountry | ''>('')
  const [bankName, setBankName] = useState<string>('')
  const [cryptoAsset, setCryptoAsset] = useState<CryptoAsset | ''>('')
  const [transactionPassword, setTransactionPassword] = useState('')
  const [successResult, setSuccessResult] = useState<DepositFlowResult | null>(null)

  const bankOptionsByCountry: Record<BankCountry, string[]> = useMemo(
    () => ({
      us: ['Bank of America', 'Chase', 'Wells Fargo'],
      uk: ['Barclays', 'HSBC', 'Lloyds Bank'],
      sg: ['DBS', 'OCBC', 'UOB'],
    }),
    [],
  )

  const amount = useMemo(() => parseAmount(amountRaw), [amountRaw])
  const fee = useMemo(() => {
    if (!amount || amount <= 0) return 0
    const calculated = amount * 0.015 + 0.3 // 1.5% + $0.30, capped at $15
    return Math.min(15, Number(calculated.toFixed(2)))
  }, [amount])

  const netAmount = useMemo(() => {
    if (!amount || amount <= 0) return 0
    return Math.max(0, Number((amount - fee).toFixed(2)))
  }, [amount, fee])

  useEffect(() => {
    if (!open) return
    setStep('amount')
    setAmountRaw('')
    setMethod('ewallet')
    setError('')
    setEwalletProvider('')
    setBankCountry('')
    setBankName('')
    setCryptoAsset('')
    setTransactionPassword('')
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
    setEwalletProvider('')
    setBankCountry('')
    setBankName('')
    setCryptoAsset('')
    setTransactionPassword('')
  }, [method, open])

  const goNext = () => {
    setError('')
    if (!amount || amount <= 0) {
      setError('Please enter a valid deposit amount')
      return
    }
    if (netAmount <= 0) {
      setError('Net deposit amount must be greater than $0.00')
      return
    }
    setStep('method')
  }

  const goToPassword = () => {
    setError('')
    if (!amount || amount <= 0) {
      setError('Please enter a valid deposit amount')
      setStep('amount')
      return
    }
    if (method === 'ewallet' && !ewalletProvider) {
      setError('Please select an e-wallet provider')
      return
    }
    if (method === 'bank') {
      if (!bankCountry) {
        setError('Please select a bank country')
        return
      }
      if (!bankName) {
        setError('Please select a bank name')
        return
      }
    }
    if (method === 'crypto' && !cryptoAsset) {
      setError('Please select a crypto asset')
      return
    }

    setStep('password')
  }

  const submitPassword = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!amount || amount <= 0) {
      setError('Please enter a valid deposit amount')
      setStep('amount')
      return
    }

    if (!transactionPassword.trim()) {
      setError('Please enter your transaction password')
      return
    }

    const reference = `EW-${Date.now().toString(36).toUpperCase()}`
    const createdAt = new Date().toISOString()

    const result: DepositFlowResult = {
      amount,
      fee,
      netAmount,
      method,
      ewalletProvider: method === 'ewallet' ? (ewalletProvider || undefined) : undefined,
      bankCountry: method === 'bank' ? (bankCountry || undefined) : undefined,
      bankName: method === 'bank' ? bankName : undefined,
      cryptoAsset: method === 'crypto' ? (cryptoAsset || undefined) : undefined,
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
            <h2 className="dfm-title">Deposit</h2>
            <p className="dfm-subtitle">{step === 'amount' ? 'Enter amount and review fee' : 'Select a deposit method'}</p>
          </div>
          <button type="button" className="dfm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={submitPassword} className="dfm-body">
          {step === 'amount' && (
            <>
              <label className="dfm-label">
                Deposit amount
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
                  <span className="dfm-row-label">Deposit fee</span>
                  <span className="dfm-row-value">{formatMoney(fee)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Net amount you will receive</span>
                  <span className="dfm-row-value dfm-row-value--net">{formatMoney(netAmount)}</span>
                </div>
              </div>

              {error && <p className="dfm-error">{error}</p>}

              <div className="dfm-actions">
                <button type="button" className="dfm-btn dfm-btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="dfm-btn dfm-btn-primary" onClick={goNext}>
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 'method' && (
            <>
              <div className="dfm-summary">
                <div className="dfm-row">
                  <span className="dfm-row-label">Deposit amount</span>
                  <span className="dfm-row-value">{formatMoney(amount ?? 0)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Fee</span>
                  <span className="dfm-row-value">{formatMoney(fee)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Net amount</span>
                  <span className="dfm-row-value dfm-row-value--net">{formatMoney(netAmount)}</span>
                </div>
              </div>

              <div className="dfm-methods">
                <label className={`dfm-method ${method === 'ewallet' ? 'dfm-method--active' : ''}`}>
                  <input type="radio" name="method" checked={method === 'ewallet'} onChange={() => setMethod('ewallet')} />
                  <div>
                    <div className="dfm-method-title">E-wallet</div>
                    <div className="dfm-method-desc">Fast transfer from another wallet</div>
                  </div>
                </label>

                <label className={`dfm-method ${method === 'bank' ? 'dfm-method--active' : ''}`}>
                  <input type="radio" name="method" checked={method === 'bank'} onChange={() => setMethod('bank')} />
                  <div>
                    <div className="dfm-method-title">Bank Transfer</div>
                    <div className="dfm-method-desc">1–3 business days (typical)</div>
                  </div>
                </label>

                <label className={`dfm-method ${method === 'crypto' ? 'dfm-method--active' : ''}`}>
                  <input type="radio" name="method" checked={method === 'crypto'} onChange={() => setMethod('crypto')} />
                  <div>
                    <div className="dfm-method-title">Crypto</div>
                    <div className="dfm-method-desc">Deposit using a wallet address</div>
                  </div>
                </label>
              </div>

              {method === 'ewallet' && (
                <div className="dfm-panel">
                  <label className="dfm-label">
                    E-wallet provider
                    <select
                      className="dfm-select"
                      value={ewalletProvider}
                      onChange={(e) => setEwalletProvider(e.target.value as EWalletProvider | '')}
                    >
                      <option value="" disabled>
                        Select provider
                      </option>
                      <option value="paypal">PayPal</option>
                      <option value="gpay">GPay</option>
                    </select>
                  </label>
                </div>
              )}

              {method === 'bank' && (
                <div className="dfm-panel">
                  <div className="dfm-grid">
                    <label className="dfm-label">
                      Bank country
                      <select
                        className="dfm-select"
                        value={bankCountry}
                        onChange={(e) => {
                          const next = e.target.value as BankCountry | ''
                          setBankCountry(next)
                          setBankName('')
                        }}
                      >
                        <option value="" disabled>
                          Select country
                        </option>
                        <option value="us">United States</option>
                        <option value="uk">United Kingdom</option>
                        <option value="sg">Singapore</option>
                      </select>
                    </label>

                    <label className="dfm-label">
                      Bank name
                      <select
                        className="dfm-select"
                        value={bankName}
                        disabled={!bankCountry}
                        onChange={(e) => setBankName(e.target.value)}
                      >
                        <option value="" disabled>
                          {bankCountry ? 'Select bank' : 'Select country first'}
                        </option>
                        {bankCountry &&
                          bankOptionsByCountry[bankCountry].map((bank) => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {method === 'crypto' && (
                <div className="dfm-panel">
                  <label className="dfm-label">
                    Asset
                    <select
                      className="dfm-select"
                      value={cryptoAsset}
                      onChange={(e) => setCryptoAsset(e.target.value as CryptoAsset | '')}
                    >
                      <option value="" disabled>
                        Select asset
                      </option>
                      <option value="tron-usdt">TRON-USDT</option>
                      <option value="tron-usdc">TRON-USDC</option>
                    </select>
                  </label>
                </div>
              )}

              {error && <p className="dfm-error">{error}</p>}

              <div className="dfm-actions">
                <button type="button" className="dfm-btn dfm-btn-secondary" onClick={() => setStep('amount')}>
                  Back
                </button>
                <button type="button" className="dfm-btn dfm-btn-primary" onClick={goToPassword}>
                  Confirm deposit
                </button>
              </div>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="dfm-summary">
                <div className="dfm-row">
                  <span className="dfm-row-label">Deposit amount</span>
                  <span className="dfm-row-value">{formatMoney(amount ?? 0)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Fee</span>
                  <span className="dfm-row-value">{formatMoney(fee)}</span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Net amount</span>
                  <span className="dfm-row-value dfm-row-value--net">{formatMoney(netAmount)}</span>
                </div>
              </div>

              <label className="dfm-label">
                Transaction password
                <input
                  className="dfm-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your transaction password"
                  value={transactionPassword}
                  onChange={(e) => setTransactionPassword(e.target.value)}
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
              <h3 className="dfm-success-title">Deposit successful</h3>
              <p className="dfm-success-subtitle">Your deposit request has been submitted.</p>

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
                  <span className="dfm-row-label">Net amount</span>
                  <span className="dfm-row-value dfm-row-value--net">
                    {formatMoney(successResult.netAmount)}
                  </span>
                </div>
                <div className="dfm-row">
                  <span className="dfm-row-label">Date</span>
                  <span className="dfm-row-value">
                    {formatUsDateTime(successResult.createdAt)}
                  </span>
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

