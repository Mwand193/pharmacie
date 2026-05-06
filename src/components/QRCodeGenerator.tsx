'use client'

import { useEffect, useState } from 'react'

export default function QRCodeGenerator({ value, size = 100 }: { value: string, size?: number }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const generateQR = async () => {
      try {
        // Importer dynamiquement pour éviter le SSR
        const QRCode = (await import('qrcode')).default
        
        // S'assurer que value est une string
        const qrValue = typeof value === 'string' ? value : JSON.stringify(value)
        
        const dataUrl = await QRCode.toDataURL(qrValue, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        })
        setQrDataUrl(dataUrl)
      } catch (err) {
        console.error('Erreur génération QR:', err)
      }
    }
    
    generateQR()
  }, [value, size, mounted])

  if (!mounted || !qrDataUrl) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        background: '#f1f5f9', 
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>QR</span>
      </div>
    )
  }

  return (
    <img 
      src={qrDataUrl} 
      alt="QR Code" 
      width={size} 
      height={size}
      style={{ borderRadius: '4px', display: 'block' }}
    />
  )
}