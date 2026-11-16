import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const menu = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: (
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" strokeLinejoin="round" />
    ),
  },
  {
    to: '/buku',
    label: 'Buku',
    icon: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v18H6.5A2.5 2.5 0 0 1 4 18.5z" strokeLinejoin="round" />
        <path d="M8 3v18" />
      </>
    ),
  },
  {
    to: '/siswa',
    label: 'Siswa',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0" strokeLinecap="round" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8" strokeLinecap="round" />
        <path d="M18 20a5 5 0 0 0-3-4.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    to: '/peminjaman',
    label: 'Peminjaman',
    icon: (
      <>
        <path d="M4 7h13l-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 17H7l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-indigo-500/20 text-white ring-1 ring-inset ring-indigo-400/40'
      : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`

function Brand() {
  return (
    <div className="mb-6 flex items-center gap-3 px-1">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-900/40">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v18H6.5A2.5 2.5 0 0 1 4 18.5z" strokeLinejoin="round" />
          <path d="M8 3v18" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-white">Perpustakaan</p>
        <p className="text-xs text-slate-400">Sistem Peminjaman</p>
      </div>
    </div>
  )
}

function Navigation({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Menu
      </p>
      {menu.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onNavigate}>
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7">
            {item.icon}
          </svg>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarFooter() {
  return (
    <div className="mt-6 rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-slate-400">
      <p className="font-semibold text-slate-200">Express + React</p>
      <p className="mt-0.5">API berjalan di port 3000</p>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 p-4 lg:flex">
        <Brand />
        <Navigation />
        <SidebarFooter />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-slate-900 p-4 shadow-2xl">
            <Brand />
            <Navigation onNavigate={() => setOpen(false)} />
            <SidebarFooter />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-sm font-bold text-slate-900">Perpustakaan Sekolah</span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <footer className="px-6 pb-6 text-xs text-slate-400">
          Sistem Manajemen Peminjaman Buku Sekolah
        </footer>
      </div>
    </div>
  )
}
