import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PerformanceChart } from '../components/PerformanceChart'
import { MoneyFlows } from '../components/MoneyFlows'
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
  totalBalance: 12450.78,
  totalDeposit: 18500,
  totalWithdrawal: 3200,
  totalPayment: 2849.22,
}

export function Dashboard() {
  const { user, logout } = useAuth()
  const [chartScope, setChartScope] = useState<ChartScope>('7d')

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
        <span className="dashboard-balance-label">Available balance</span>
        <div className="dashboard-balance-row">
          <p className="dashboard-balance-value">
            ${MOCK_DATA.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="dashboard-balance-actions">
            <button type="button" className="dashboard-btn dashboard-btn-deposit">
              Deposit
            </button>
            <button type="button" className="dashboard-btn dashboard-btn-withdraw">
              Withdraw
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
    </div>
  )
}
