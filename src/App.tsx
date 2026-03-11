import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TransactionsProvider } from './context/TransactionsContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { TransactionsHistory } from './pages/TransactionsHistory'
import { TransactionDetails } from './pages/TransactionDetails'
import { MyAccount } from './pages/MyAccount'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <TransactionsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<TransactionsHistory />} />
              <Route path="transactions/:id" element={<TransactionDetails />} />
              <Route path="account" element={<MyAccount />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TransactionsProvider>
    </AuthProvider>
  )
}

export default App
