import { useState, useEffect, useCallback } from 'react'

type Toast = { id: number; message: string; type: 'success' | 'error' }

let addToastFn: ((msg: string, type: Toast['type']) => void) | null = null

export function toast(message: string, type: Toast['type'] = 'success') {
  addToastFn?.(message, type)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  useEffect(() => { addToastFn = addToast }, [addToast])

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? '✓' : '✕'} {t.message}
        </div>
      ))}
    </div>
  )
}
