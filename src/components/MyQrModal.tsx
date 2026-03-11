import { useEffect, useState } from 'react'
import * as QRCode from 'qrcode'
import './DepositFlowModal.css'

interface MyQrModalProps {
  open: boolean
  userId: string
  onClose: () => void
}

export function MyQrModal({ open, userId, onClose }: MyQrModalProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const value = userId || 'wallet-user'
    QRCode.toDataURL(value, {
      width: 220,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url: string) => setDataUrl(url))
      .catch(() => setDataUrl(null))
  }, [open, userId])

  if (!open) return null

  return (
    <div className="dfm-overlay" onClick={onClose} role="presentation">
      <div className="dfm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dfm-header">
          <div>
            <h2 className="dfm-title">My QR</h2>
            <p className="dfm-subtitle">Scan to pay this wallet ID</p>
          </div>
          <button type="button" className="dfm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="dfm-body" style={{ alignItems: 'center', justifyItems: 'center' }}>
          <div className="dfm-panel" style={{ alignItems: 'center', textAlign: 'center' }}>
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="Wallet QR code"
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 18,
                  background: '#ffffff',
                }}
              />
            ) : (
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 18,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                }}
              >
                Generating QR…
              </div>
            )}
            <p className="dfm-subtitle" style={{ marginTop: 10 }}>
              Wallet ID
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-all', margin: 0 }}>
              {userId}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

