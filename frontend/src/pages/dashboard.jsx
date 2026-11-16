import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { peminjamanApi, pesanError } from '../api'
import { EmptyState, PageHeader, Spinner, StatusBadge, btnPrimary, btnSecondary, tableWrapper } from '../components/ui'

const formatTanggal = (nilai) => {
  if (!nilai) return '-'
  const tanggal = new Date(nilai)
  if (Number.isNaN(tanggal.getTime())) return nilai
  return tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const kartu = [
  { key: 'total_peminjaman', label: 'Total Peminjaman', tone: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  { key: 'sedang_dipinjam', label: 'Sedang Dipinjam', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { key: 'sudah_dikembalikan', label: 'Sudah Dikembalikan', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  { key: 'terlambat', label: 'Terlambat', tone: 'bg-rose-50 text-rose-700 ring-rose-200' },
]

const Dashboard = () => {
  const [statistik, setStatistik] = useState(null)
  const [terpopuler, setTerpopuler] = useState([])
  const [terbaru, setTerbaru] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let aktif = true

    const muat = async () => {
      try {
        const [laporan, daftar] = await Promise.all([
          peminjamanApi.statistik(),
          peminjamanApi.list({}),
        ])
        if (!aktif) return
        setStatistik(laporan.statistik || null)
        setTerpopuler(laporan.buku_terpopuler || [])
        setTerbaru(daftar.slice(0, 5))
      } catch (err) {
        if (aktif) setError(pesanError(err))
      } finally {
        if (aktif) setLoading(false)
      }
    }

    muat()

    return () => {
      aktif = false
    }
  }, [])

  const nilai = (key) => Number(statistik?.[key] ?? 0)
  const maksimalPopuler = Math.max(...terpopuler.map((buku) => Number(buku.jumlah_peminjaman)), 1)

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan aktivitas perpustakaan sekolah.">
        <Link to="/peminjaman" className={btnSecondary}>
          Lihat Peminjaman
        </Link>
        <Link to="/buku" className={btnPrimary}>
          <span className="text-base leading-none">+</span> Kelola Buku
        </Link>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-16 text-sm text-slate-500 shadow-sm">
          <Spinner /> Memuat ringkasan...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-10 text-center text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kartu.map((item) => (
              <div key={item.key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{nilai(item.key)}</p>
                <span
                  className={`mt-3 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${item.tone}`}
                >
                  {item.key === 'terlambat' && nilai(item.key) > 0 ? 'Perlu tindak lanjut' : 'Data terkini'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <section className="lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                  Peminjaman Terbaru
                </h2>
                <Link to="/peminjaman" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Lihat semua
                </Link>
              </div>
              <div className={tableWrapper}>
                {terbaru.length === 0 ? (
                  <EmptyState
                    title="Belum ada peminjaman"
                    description="Catat peminjaman pertama lewat menu Peminjaman."
                  />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {terbaru.map((row) => (
                      <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{row.buku_judul}</p>
                          <p className="truncate text-xs text-slate-500">
                            {row.siswa_nama} · {row.siswa_kelas} · {formatTanggal(row.tanggal_pinjam)}
                          </p>
                        </div>
                        <StatusBadge status={row.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="lg:col-span-2">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
                Buku Terpopuler
              </h2>
              <div className={`${tableWrapper} p-4`}>
                {terpopuler.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">Belum ada data.</p>
                ) : (
                  <ul className="space-y-4">
                    {terpopuler.map((buku) => {
                      const jumlah = Number(buku.jumlah_peminjaman)
                      return (
                        <li key={buku.id}>
                          <div className="mb-1 flex items-baseline justify-between gap-2">
                            <p className="truncate text-sm font-medium text-slate-800">{buku.judul}</p>
                            <span className="shrink-0 text-xs font-semibold text-slate-500">{jumlah}x</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${(jumlah / maksimalPopuler) * 100}%` }}
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </>
  )
}

export default Dashboard
