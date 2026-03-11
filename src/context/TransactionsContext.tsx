import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed'
export type TransactionBusiness = 'Deposit' | 'Withdrawal' | 'Payment'

export interface WalletTransaction {
  id: string
  userEmail: string
  reference: string
  status: TransactionStatus
  totalAmount: number
  fee: number
  netAmountCredit: number
  createdAt: string
  businessDescription: TransactionBusiness
  method?: 'ewallet' | 'bank' | 'crypto'
  ewalletProvider?: 'paypal' | 'gpay'
  bankCountry?: 'us' | 'uk' | 'sg'
  bankName?: string
  cryptoAsset?: 'tron-usdt' | 'tron-usdc'
  walletAddress?: string
}

interface TransactionsContextValue {
  transactions: WalletTransaction[]
  addTransaction: (tx: Omit<WalletTransaction, 'id'>) => void
  clearMyTransactions: () => void
  balance: number
}

const STORAGE_KEY = 'wallet-app-transactions'

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

function loadAll(): WalletTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WalletTransaction[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [allTransactions, setAllTransactions] = useState<WalletTransaction[]>(loadAll)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTransactions))
  }, [allTransactions])

  const transactions = useMemo(() => {
    if (!user) return []
    return allTransactions
      .filter((t) => t.userEmail === user.email)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [allTransactions, user])

  const balance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.businessDescription === 'Deposit') {
        return acc + t.netAmountCredit
      }
      if (t.businessDescription === 'Withdrawal' || t.businessDescription === 'Payment') {
        return acc - t.netAmountCredit
      }
      return acc
    }, 0)
  }, [transactions])

  const addTransaction = useCallback((tx: Omit<WalletTransaction, 'id'>) => {
    setAllTransactions((prev) => [{ ...tx, id: crypto.randomUUID() }, ...prev])
  }, [])

  const clearMyTransactions = useCallback(() => {
    setAllTransactions((prev) => prev.filter((t) => t.userEmail !== user?.email))
  }, [user?.email])

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, clearMyTransactions, balance }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider')
  return ctx
}

