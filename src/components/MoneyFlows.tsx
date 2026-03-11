import './MoneyFlows.css'

interface MoneyFlowsProps {
  totalDeposit: number
  totalWithdrawal: number
  totalPayment: number
}

function formatAmount(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function MoneyFlows({ totalDeposit, totalWithdrawal, totalPayment }: MoneyFlowsProps) {
  return (
    <div className="money-flows">
      <div className="money-flow-card money-flow-deposit">
        <span className="money-flow-label">Total deposit</span>
        <span className="money-flow-value">{formatAmount(totalDeposit)}</span>
      </div>
      <div className="money-flow-card money-flow-withdrawal">
        <span className="money-flow-label">Total withdrawal</span>
        <span className="money-flow-value">{formatAmount(totalWithdrawal)}</span>
      </div>
      <div className="money-flow-card money-flow-payment">
        <span className="money-flow-label">Total payment</span>
        <span className="money-flow-value">{formatAmount(totalPayment)}</span>
      </div>
    </div>
  )
}
