const TOKEN_KEY = 'wallet-app-token'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = res.statusText
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export interface ApiUser {
  id: string
  name: string
  email: string
}

export interface ApiTransaction {
  id: string
  userEmail: string
  reference: string
  status: 'Completed' | 'Pending' | 'Failed'
  totalAmount: number
  fee: number
  netAmountCredit: number
  createdAt: string
  businessDescription: 'Deposit' | 'Withdrawal' | 'Payment'
  method?: 'ewallet' | 'bank' | 'crypto'
  ewalletProvider?: 'paypal' | 'gpay'
  bankCountry?: 'us' | 'uk' | 'sg'
  bankName?: string
  cryptoAsset?: 'tron-usdt' | 'tron-usdc'
  walletAddress?: string
}

export interface TransactionsResponse {
  transactions: ApiTransaction[]
  balance: number
  totalDeposit: number
  totalWithdrawal: number
  totalPayment: number
}

export const api = {
  register(name: string, email: string, password: string) {
    return request<{ ok: true }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  },

  login(email: string, password: string) {
    return request<{ token: string; user: ApiUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  me() {
    return request<{ user: ApiUser }>('/api/auth/me')
  },

  verifyPassword(password: string) {
    return request<{ ok: true }>('/api/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  },

  getTransactions() {
    return request<TransactionsResponse>('/api/transactions')
  },

  createTransaction(tx: Omit<ApiTransaction, 'id' | 'userEmail'>) {
    return request<{ transaction: ApiTransaction }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    })
  },
}
