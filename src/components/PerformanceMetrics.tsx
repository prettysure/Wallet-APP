import './PerformanceMetrics.css'

interface PerformanceMetricsProps {
  change24h: number
  change7d: number
  change30d: number
}

function MetricCard({ label, value, positive }: { label: string; value: number; positive: boolean }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className={`metric-value ${positive ? 'positive' : 'negative'}`}>
        {value >= 0 ? '+' : ''}{value}%
      </span>
    </div>
  )
}

export function PerformanceMetrics({ change24h, change7d, change30d }: PerformanceMetricsProps) {
  return (
    <div className="performance-metrics">
      <MetricCard label="24h" value={change24h} positive={change24h >= 0} />
      <MetricCard label="7d" value={change7d} positive={change7d >= 0} />
      <MetricCard label="30d" value={change30d} positive={change30d >= 0} />
    </div>
  )
}
