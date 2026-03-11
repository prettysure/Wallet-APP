import './TabPage.css'

export function TransactionsHistory() {
  return (
    <div className="tab-page">
      <header className="tab-page-header">
        <h1 className="tab-page-title">Transactions history</h1>
        <p className="tab-page-subtitle">View your deposits, withdrawals, and bill payments</p>
      </header>
      <section className="tab-page-placeholder">
        <p>Transaction list will appear here.</p>
      </section>
    </div>
  )
}
