import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.DATA_DIR ?? path.join(__dirname, '..', 'data')
const dbPath = process.env.DATABASE_PATH ?? path.join(dataDir, 'wallet.db')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reference TEXT NOT NULL,
    status TEXT NOT NULL,
    total_amount REAL NOT NULL,
    fee REAL NOT NULL,
    net_amount_credit REAL NOT NULL,
    created_at TEXT NOT NULL,
    business_description TEXT NOT NULL,
    method TEXT,
    ewallet_provider TEXT,
    bank_country TEXT,
    bank_name TEXT,
    crypto_asset TEXT,
    wallet_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user_created
    ON transactions(user_id, created_at DESC);
`)

export interface DbUser {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: string
}

export interface DbTransaction {
  id: string
  user_id: string
  reference: string
  status: string
  total_amount: number
  fee: number
  net_amount_credit: number
  created_at: string
  business_description: string
  method: string | null
  ewallet_provider: string | null
  bank_country: string | null
  bank_name: string | null
  crypto_asset: string | null
  wallet_address: string | null
}
