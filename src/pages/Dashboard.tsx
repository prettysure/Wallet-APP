import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTransactions } from '../context/TransactionsContext'
import { PerformanceChart } from '../components/PerformanceChart'
import { MoneyFlows } from '../components/MoneyFlows'
import { DepositFlowModal } from '../components/DepositFlowModal'
import { WithdrawFlowModal } from '../components/WithdrawFlowModal'
import { TransferFlowModal } from '../components/TransferFlowModal'
import { MyQrModal } from '../components/MyQrModal'
import './Dashboard.css'

type ChartScope = '7d' | '30d'

const MOCK_BILLERS = [
  { id: '1', name: 'Electric Co.', logo: null },
  { id: '2', name: 'Water Utility', logo: null },
  { id: '3', name: 'Internet Provider', logo: null },
  { id: '4', name: 'Gas Company', logo: null },
  { id: '5', name: 'Mobile Phone', logo: null },
]

const CHART_DATA_7D = [
  { date: 'Mar 5', value: 12100 },
  { date: 'Mar 6', value: 12180 },
  { date: 'Mar 7', value: 12020 },
  { date: 'Mar 8', value: 12200 },
  { date: 'Mar 9', value: 12280 },
  { date: 'Mar 10', value: 12350 },
  { date: 'Mar 11', value: 12450.78 },
]

const CHART_DATA_30D = [
  { date: 'Mar 1', value: 11800 },
  { date: 'Mar 4', value: 11950 },
  { date: 'Mar 7', value: 12020 },
  { date: 'Mar 10', value: 12200 },
  { date: 'Mar 13', value: 12150 },
  { date: 'Mar 16', value: 12300 },
  { date: 'Mar 19', value: 12280 },
  { date: 'Mar 22', value: 12400 },
  { date: 'Mar 25', value: 12320 },
  { date: 'Mar 28', value: 12450.78 },
]

const MOCK_DATA = {
  totalDeposit: 18500,
  totalWithdrawal: 3200,
  totalPayment: 2849.22,
}

export function Dashboard() {
  const { user, logout } = useAuth()
  const { addTransaction, balance } = useTransactions()
  const [chartScope, setChartScope] = useState<ChartScope>('7d')
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const chartData = chartScope === '7d' ? CHART_DATA_7D : CHART_DATA_30D

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My E-Wallet</h1>
          <p className="dashboard-greeting">Hello, {user?.name}</p>
        </div>
        <button type="button" className="dashboard-logout" onClick={logout}>
          Sign out
        </button>
      </header>

      <section className="dashboard-balance">
        <div className="dashboard-balance-header">
          <span className="dashboard-balance-label">Available balance</span>
          <div className="dashboard-balance-tools">
            <button
              type="button"
              className="dashboard-icon-btn"
              aria-label="Check my QR"
              onClick={() => setQrOpen(true)}
            >
              <span className="dashboard-icon-svg" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <rect x="1.5" y="1.5" width="5" height="5" rx="1.2" />
                  <rect x="9.5" y="1.5" width="5" height="5" rx="1.2" />
                  <rect x="1.5" y="9.5" width="5" height="5" rx="1.2" />
                  <rect x="9.5" y="9.5" width="2" height="2" />
                  <rect x="12" y="12" width="2.5" height="1.5" />
                </svg>
              </span>
            </button>
            <button
              type="button"
              className="dashboard-icon-btn"
              aria-label="Scan to pay"
              onClick={() => balance > 0 && setTransferOpen(true)}
            >
              <span className="dashboard-icon-svg" aria-hidden="true">
                <svg viewBox="0 0 1024 1024">
                  <path
                    d="M928.016126 543.908618 95.983874 543.908618c-17.717453 0-31.994625-14.277171-31.994625-31.994625S78.26642 479.919368 95.983874 479.919368l832.032253 0c17.717453 0 31.994625 14.277171 31.994625 31.994625S945.73358 543.908618 928.016126 543.908618z"
                    fill="#575B66"
                  />
                  <path
                    d="M832.032253 928.016126 639.892491 928.016126c-17.717453 0-31.994625-14.277171-31.994625-31.994625s14.277171-31.994625 31.994625-31.994625l191.967747 0c17.717453 0 31.994625-14.277171 31.994625-31.994625l0-159.973123c0-17.717453 14.277171-31.994625 31.994625-31.994625s31.994625 14.277171 31.994625 31.994625l0 159.973123C928.016126 884.840585 884.840585 928.016126 832.032253 928.016126z"
                    fill="#575B66"
                  />
                  <path
                    d="M351.94087 928.016126l-159.973123 0c-52.980346 0-95.983874-43.003528-95.983874-95.983874l0-159.973123c0-17.717453 14.277171-31.994625 31.994625-31.994625S159.973123 654.341676 159.973123 672.05913l0 159.973123c0 17.717453 14.449185 31.994625 31.994625 31.994625l159.973123 0c17.717453 0 31.994625 14.277171 31.994625 31.994625C383.935495 913.738955 369.658324 928.016126 351.94087 928.016126z"
                    fill="#575B66"
                  />
                  <path
                    d="M127.978498 383.935495c-17.717453 0-31.994625-14.277171-31.994625-31.994625l0-159.973123c0-52.980346 43.003528-95.983874 95.983874-95.983874l159.973123 0c17.717453 0 31.994625 14.277171 31.994625 31.994625S369.658324 159.973123 351.94087 159.973123l-159.973123 0c-17.545439 0-31.994625 14.449185-31.994625 31.994625l0 159.973123C159.973123 369.658324 145.695952 383.935495 127.978498 383.935495z"
                    fill="#575B66"
                  />
                  <path
                    d="M896.021502 383.935495c-17.717453 0-31.994625-14.277171-31.994625-31.994625l0-159.973123c0-17.545439-14.277171-31.994625-31.994625-31.994625L639.892491 159.973123c-17.717453 0-31.994625-14.277171-31.994625-31.994625s14.277171-31.994625 31.994625-31.994625l191.967747 0c52.980346 0 95.983874 43.003528 95.983874 95.983874l0 159.973123C928.016126 369.658324 913.738955 383.935495 896.021502 383.935495z"
                    fill="#575B66"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
        <div className="dashboard-balance-row">
          <p className="dashboard-balance-value">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="dashboard-balance-actions">
            <button type="button" className="dashboard-btn dashboard-btn-deposit" onClick={() => setDepositOpen(true)}>
              <span className="dashboard-btn-icon">+</span>
              <span>Deposit</span>
            </button>
            <button
              type="button"
              className="dashboard-btn dashboard-btn-transfer"
              disabled={balance <= 0}
              onClick={() => balance > 0 && setTransferOpen(true)}
            >
              <span className="dashboard-btn-icon">⇄</span>
              <span>Transfer</span>
            </button>
            <button
              type="button"
              className="dashboard-btn dashboard-btn-withdraw"
              disabled={balance <= 0}
              onClick={() => balance > 0 && setWithdrawOpen(true)}
            >
              <span className="dashboard-btn-icon">−</span>
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-quickpay-section">
        <h2 className="dashboard-section-title">Quick pay</h2>
        <div className="dashboard-billers-block">
          {MOCK_BILLERS.map((biller) => (
            <button key={biller.id} type="button" className="dashboard-biller-cell">
              <span className="dashboard-biller-logo">
                {biller.logo ? (
                  <img src={biller.logo} alt="" className="dashboard-biller-logo-img" />
                ) : (
                  <span className="dashboard-biller-logo-initial">{biller.name.charAt(0)}</span>
                )}
              </span>
              <span className="dashboard-biller-name">{biller.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-flows-section">
        <h2 className="dashboard-section-title">Money flows</h2>
        <p className="dashboard-flows-desc">
          Total amounts deposited, withdrawn, and paid in bills.
        </p>
        <MoneyFlows
          totalDeposit={MOCK_DATA.totalDeposit}
          totalWithdrawal={MOCK_DATA.totalWithdrawal}
          totalPayment={MOCK_DATA.totalPayment}
        />
      </section>

      <section className="dashboard-chart-section">
        <div className="dashboard-chart-header">
          <h2 className="dashboard-section-title">Balance performance</h2>
          <div className="dashboard-chart-scope">
            <button
              type="button"
              className={`dashboard-scope-btn ${chartScope === '7d' ? 'dashboard-scope-btn--active' : ''}`}
              onClick={() => setChartScope('7d')}
            >
              Last 7 days
            </button>
            <button
              type="button"
              className={`dashboard-scope-btn ${chartScope === '30d' ? 'dashboard-scope-btn--active' : ''}`}
              onClick={() => setChartScope('30d')}
            >
              Last 30 days
            </button>
          </div>
        </div>
        <p className="dashboard-performance-desc">
          How your balance moved. The line reflects:
        </p>
        <ul className="dashboard-fluctuation-reasons">
          <li><strong>Deposits</strong> — Money in from other funding sources (line goes up).</li>
          <li><strong>Bill payments</strong> — Payments from the wallet (line goes down).</li>
          <li><strong>Withdrawals</strong> — Money out to other accounts (line goes down).</li>
        </ul>
        <PerformanceChart data={chartData} />
      </section>

      <DepositFlowModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onConfirm={(result) => {
          if (!user) return
          addTransaction({
            userEmail: user.email,
            reference: result.reference,
            status: 'Completed',
            totalAmount: result.amount,
            fee: result.fee,
            netAmountCredit: result.netAmount,
            createdAt: result.createdAt,
            businessDescription: 'Deposit',
            method: result.method,
            ewalletProvider: result.ewalletProvider,
            bankCountry: result.bankCountry,
            bankName: result.bankName,
            cryptoAsset: result.cryptoAsset,
          })
        }}
      />

      <WithdrawFlowModal
        open={withdrawOpen}
        currentBalance={balance}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={(result) => {
          if (!user) return
          addTransaction({
            userEmail: user.email,
            reference: result.reference,
            status: 'Completed',
            totalAmount: result.amount,
            fee: result.fee,
            netAmountCredit: result.totalDeduction,
            createdAt: result.createdAt,
            businessDescription: 'Withdrawal',
            method: result.method === 'paypal' ? 'ewallet' : 'crypto',
            ewalletProvider: result.method === 'paypal' ? 'paypal' : undefined,
            walletAddress: result.method === 'tron' ? result.walletAddress : undefined,
          })
        }}
      />

      <MyQrModal open={qrOpen} userId={user?.id ?? ''} onClose={() => setQrOpen(false)} />

      <TransferFlowModal
        open={transferOpen}
        currentBalance={balance}
        onClose={() => setTransferOpen(false)}
        onConfirm={(result) => {
          if (!user) return
          addTransaction({
            userEmail: user.email,
            reference: result.reference,
            status: 'Completed',
            totalAmount: result.amount,
            fee: 0,
            netAmountCredit: result.totalDeduction,
            createdAt: result.createdAt,
            businessDescription: 'Payment',
            method: 'crypto',
            walletAddress: result.receiverId,
          })
        }}
      />
    </div>
  )
}
