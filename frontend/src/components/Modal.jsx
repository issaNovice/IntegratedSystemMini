export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="font-semibold text-lg">{title}</div>
        </div>
        <div className="p-5">
          {children}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
          {footer}
        </div>
      </div>
    </div>
  )
}


