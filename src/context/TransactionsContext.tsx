import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, type ApiTransaction } from '../api/client'
import { useAuth } from './AuthContext'

export type TransactionStatus = ApiTransaction['status']
export type TransactionBusiness = ApiTransaction['businessDescription']
export type WalletTransaction = ApiTransaction

interface TransactionsContextValue {
  transactions: WalletTransaction[]
  balance: number
  totalDeposit: number
  totalWithdrawal: number
  totalPayment: number
  loading: boolean
  addTransaction: (tx: Omit<WalletTransaction, 'id' | 'userEmail'>) => Promise<void>
  refreshTransactions: () => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [balance, setBalance] = useState(0)
  const [totalDeposit, setTotalDeposit] = useState(0)
  const [totalWithdrawal, setTotalWithdrawal] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [loading, setLoading] = useState(false)

  const applyResponse = useCallback((data: Awaited<ReturnType<typeof api.getTransactions>>) => {
    setTransactions(data.transactions)
    setBalance(data.balance)
    setTotalDeposit(data.totalDeposit)
    setTotalWithdrawal(data.totalWithdrawal)
    setTotalPayment(data.totalPayment)
  }, [])

  const refreshTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setBalance(0)
      setTotalDeposit(0)
      setTotalWithdrawal(0)
      setTotalPayment(0)
      return
    }

    setLoading(true)
    try {
      const data = await api.getTransactions()
      applyResponse(data)
    } finally {
      setLoading(false)
    }
  }, [user, applyResponse])

  useEffect(() => {
    refreshTransactions()
  }, [refreshTransactions])

  const addTransaction = useCallback(
    async (tx: Omit<WalletTransaction, 'id' | 'userEmail'>) => {
      const { transaction } = await api.createTransaction(tx)
      setTransactions((prev) => [transaction, ...prev])
      if (transaction.businessDescription === 'Deposit') {
        setBalance((b) => Number((b + transaction.netAmountCredit).toFixed(2)))
        setTotalDeposit((d) => Number((d + transaction.totalAmount).toFixed(2)))
      } else if (transaction.businessDescription === 'Withdrawal') {
        setBalance((b) => Number((b - transaction.netAmountCredit).toFixed(2)))
        setTotalWithdrawal((w) => Number((w + transaction.totalAmount).toFixed(2)))
      } else {
        setBalance((b) => Number((b - transaction.netAmountCredit).toFixed(2)))
        setTotalPayment((p) => Number((p + transaction.totalAmount).toFixed(2)))
      }
    },
    [],
  )

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        balance,
        totalDeposit,
        totalWithdrawal,
        totalPayment,
        loading,
        addTransaction,
        refreshTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider')
  return ctx
}
