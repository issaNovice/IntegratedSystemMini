import { useEffect } from 'react'

export default function Toast({ open, kind = 'success', message, onClose, duration = 2500 }) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(t)
  }, [open, duration, onClose])
  if (!open) return null
  const color = kind === 'error' ? 'bg-red-600' : 'bg-emerald-600'
  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center">
      <div className={`${color} text-white px-4 py-2 rounded shadow`}>{message}</div>
    </div>
  )
}


