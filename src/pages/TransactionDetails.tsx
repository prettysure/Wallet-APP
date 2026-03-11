import './TabPage.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useTransactions } from '../context/TransactionsContext'
import { formatUsDateTime } from '../utils/date'

function formatMoney(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function TransactionDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { transactions } = useTransactions()

  const tx = transactions.find((t) => t.id === id)

  const methodLabel =
    tx?.method === 'ewallet'
      ? 'E-wallet'
      : tx?.method === 'bank'
        ? 'Bank transfer'
        : tx?.method === 'crypto'
          ? 'Crypto'
          : undefined

  const ewalletProviderLabel =
    tx?.ewalletProvider === 'paypal' ? 'PayPal' : tx?.ewalletProvider === 'gpay' ? 'GPay' : undefined

  const bankCountryLabel =
    tx?.bankCountry === 'us'
      ? 'United States'
      : tx?.bankCountry === 'uk'
        ? 'United Kingdom'
        : tx?.bankCountry === 'sg'
          ? 'Singapore'
          : undefined

  const cryptoAssetLabel =
    tx?.cryptoAsset === 'tron-usdt' ? 'TRON-USDT' : tx?.cryptoAsset === 'tron-usdc' ? 'TRON-USDC' : undefined

  const isDeposit = tx?.businessDescription === 'Deposit'
  const signedNet = tx ? `${isDeposit ? '+' : '-'}${formatMoney(tx.netAmountCredit)}` : ''

  if (!tx) {
    return (
      <div className="tab-page">
        <header className="tab-page-header">
          <h1 className="tab-page-title">Transaction details</h1>
        </header>
        <section className="tab-page-placeholder">
          <p>Transaction not found.</p>
          <button type="button" className="account-logout" onClick={() => navigate('/transactions')}>
            Back to history
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="tab-page">
      <header className="tab-page-header">
        <h1 className="tab-page-title">Transaction details</h1>
        <p className="tab-page-subtitle">Reference {tx.reference}</p>
      </header>

      <section className="tab-page-content">
        <div className="account-card">
          <div className="account-row">
            <span className="account-label">Status</span>
            <span className="account-value">{tx.status}</span>
          </div>
          <div className="account-row">
            <span className="account-label">Business</span>
            <span className="account-value">{tx.businessDescription}</span>
          </div>
          {methodLabel && (
            <div className="account-row">
              <span className="account-label">Deposit method</span>
              <span className="account-value">
                {methodLabel}
                {tx.method === 'ewallet' && ewalletProviderLabel ? ` (${ewalletProviderLabel})` : null}
                {tx.method === 'bank' && tx.bankName ? ` (${tx.bankName}${bankCountryLabel ? `, ${bankCountryLabel}` : ''})` : null}
                {tx.method === 'crypto' && cryptoAssetLabel ? ` (${cryptoAssetLabel})` : null}
              </span>
            </div>
          )}
          {tx.method === 'ewallet' && ewalletProviderLabel && (
            <div className="account-row">
              <span className="account-label">Provider</span>
              <span className="account-value">{ewalletProviderLabel}</span>
            </div>
          )}
          {tx.walletAddress && (
            <div className="account-row">
              <span className="account-label">Wallet address</span>
              <span className="account-value">{tx.walletAddress}</span>
            </div>
          )}
          <div className="account-row">
            <span className="account-label">Total amount</span>
            <span className="account-value">{formatMoney(tx.totalAmount)}</span>
          </div>
          <div className="account-row">
            <span className="account-label">Fee</span>
            <span className="account-value">{formatMoney(tx.fee)}</span>
          </div>
          <div className="account-row">
            <span className="account-label">Net amount credit</span>
            <span className={`account-value ${isDeposit ? 'account-value--green' : 'account-value--red'}`}>{signedNet}</span>
          </div>
          <div className="account-row">
            <span className="account-label">Date</span>
            <span className="account-value">{formatUsDateTime(tx.createdAt)}</span>
          </div>
          <div className="account-row">
            <span className="account-label">Reference no.</span>
            <span className="account-value">{tx.reference}</span>
          </div>
        </div>

        <button type="button" className="account-logout" onClick={() => navigate(-1)}>
          Back
        </button>
      </section>
    </div>
  )
}

