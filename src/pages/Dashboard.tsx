import { useAuth } from '../context/AuthContext'
import { PerformanceChart } from '../components/PerformanceChart'
import { PerformanceMetrics } from '../components/PerformanceMetrics'
import './Dashboard.css'

const MOCK_PERFORMANCE = {
  totalBalance: 12450.78,
  change24h: 2.34,
  change7d: -1.2,
  change30d: 5.67,
  chartData: [
    { date: 'Mar 1', value: 11800 },
    { date: 'Mar 3', value: 11950 },
    { date: 'Mar 5', value: 12100 },
    { date: 'Mar 7', value: 12020 },
    { date: 'Mar 9', value: 12280 },
    { date: 'Mar 11', value: 12450.78 },
  ],
}

export function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-greeting">Hello, {user?.name}</p>
        </div>
        <button type="button" className="dashboard-logout" onClick={logout}>
          Sign out
        </button>
      </header>

      <section className="dashboard-balance">
        <span className="dashboard-balance-label">Portfolio value</span>
        <p className="dashboard-balance-value">
          ${MOCK_PERFORMANCE.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </section>

      <PerformanceMetrics
        change24h={MOCK_PERFORMANCE.change24h}
        change7d={MOCK_PERFORMANCE.change7d}
        change30d={MOCK_PERFORMANCE.change30d}
      />

      <section className="dashboard-chart-section">
        <h2 className="dashboard-section-title">Performance</h2>
        <PerformanceChart data={MOCK_PERFORMANCE.chartData} />
      </section>
    </div>
  )
}
