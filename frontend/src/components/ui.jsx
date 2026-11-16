import Modal from './Modal'

export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60'

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60'

export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60'

export const btnSecondarySm =
  'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'

export const btnEdit =
  'rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50'

export const btnHapus =
  'rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50'

export const tableWrapper = 'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 ${className}`}
    />
  )
}

export function PageHeader({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  )
}

const statusStyle = {
  dipinjam: 'bg-amber-50 text-amber-700 ring-amber-200',
  dikembalikan: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  terlambat: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export function StatusBadge({ status }) {
  const style = statusStyle[status] || 'bg-slate-100 text-slate-600 ring-slate-200'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${style}`}
    >
      {status || '-'}
    </span>
  )
}

export function StokBadge({ stok }) {
  const habis = Number(stok) <= 0
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        habis ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {stok}
    </span>
  )
}

export function EmptyState({ title = 'Belum ada data', description }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  )
}

export function Pagination({ page, setPage, count, limit = 50 }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
      <span>
        Halaman {page} &middot; {count} data ditampilkan
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className={btnSecondarySm}
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          Sebelumnya
        </button>
        <button
          type="button"
          className={btnSecondarySm}
          onClick={() => setPage(page + 1)}
          disabled={count < limit}
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Hapus',
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onCancel} disabled={loading}>
            Batal
          </button>
          <button type="button" className={btnDanger} onClick={onConfirm} disabled={loading}>
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </>
      }
    />
  )
}

export function Toast({ toast, onClose }) {
  if (!toast) return null
  const error = toast.tipe === 'err'

  return (
    <div
      className={`fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ${
        error ? 'bg-rose-50 text-rose-800 ring-rose-200' : 'bg-emerald-50 text-emerald-800 ring-emerald-200'
      }`}
      role="status"
    >
      <span className="mt-0.5 font-bold">{error ? '!' : '✓'}</span>
      <p className="flex-1">{toast.text}</p>
      <button
        type="button"
        onClick={onClose}
        className="text-xs font-semibold opacity-60 transition hover:opacity-100"
      >
        Tutup
      </button>
    </div>
  )
}
