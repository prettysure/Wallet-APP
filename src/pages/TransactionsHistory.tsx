import './TabPage.css'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../context/TransactionsContext'
import { formatUsDateTime } from '../utils/date'

function formatMoney(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function TransactionsHistory() {
  const { transactions } = useTransactions()
  const navigate = useNavigate()

  return (
    <div className="tab-page">
      <header className="tab-page-header">
        <h1 className="tab-page-title">Transactions history</h1>
        <p className="tab-page-subtitle">View your deposits, withdrawals, and bill payments</p>
      </header>

      {transactions.length === 0 ? (
        <section className="tab-page-placeholder">
          <p>No transactions yet. Make a deposit to see it here.</p>
        </section>
      ) : (
        <section className="tab-page-card">
          <div className="tab-page-list">
            {transactions.map((t) => (
              // Deposit = money in, others = money out
              <button
                key={t.id}
                type="button"
                className="tab-page-list-row tab-page-list-row--clickable"
                onClick={() => navigate(`/transactions/${t.id}`)}
              >
                {(() => {
                  const isInflow = t.businessDescription === 'Deposit'
                  const sign = isInflow ? '+' : '-'
                  const signedNet = `${sign}${formatMoney(t.netAmountCredit)}`

                  return (
                    <>
                      <div className="tab-page-list-main">
                        <div className="tab-page-list-title">
                          {t.businessDescription}{' '}
                          <span className={`tab-page-pill tab-page-pill--${t.status.toLowerCase()}`}>{t.status}</span>
                        </div>
                        <div className="tab-page-list-sub">
                          <span>Ref: {t.reference}</span>
                          <span>•</span>
                          <span className="tab-page-date">{formatUsDateTime(t.createdAt)}</span>
                        </div>
                      </div>

                      <div className="tab-page-list-details">
                        <div className="tab-page-kv">
                          <span>Total</span>
                          <strong>{formatMoney(t.totalAmount)}</strong>
                        </div>
                        <div className="tab-page-kv">
                          <span>Fee</span>
                          <strong>{formatMoney(t.fee)}</strong>
                        </div>
                        <div className="tab-page-kv">
                          <span>Net credit</span>
                          <strong className={isInflow ? 'tab-page-kv--green' : 'tab-page-kv--red'}>{signedNet}</strong>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
