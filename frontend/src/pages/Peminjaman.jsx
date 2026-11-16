import { useEffect, useState } from 'react'
import { bukuApi, peminjamanApi, pesanError, siswaApi } from '../api'
import Modal from '../components/Modal'
import { ConfirmDialog, EmptyState, Field, PageHeader, Pagination, Spinner, StatusBadge, Toast, btnEdit, btnHapus, btnPrimary, btnSecondary, inputClass, tableWrapper } from '../components/ui'
import useToast from '../hooks/useToast'

const LIMIT = 50
const FILTER = [
  { value: '', label: 'Semua' },
  { value: 'dipinjam', label: 'Dipinjam' },
  { value: 'dikembalikan', label: 'Dikembalikan' },
  { value: 'terlambat', label: 'Terlambat' },
]

const hariIni = () => new Date().toISOString().slice(0, 10)

const formatTanggal = (nilai) => {
  if (!nilai) return '-'
  const tanggal = new Date(nilai)
  if (Number.isNaN(tanggal.getTime())) return nilai
  return tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formKosong = () => ({ siswa_id: '', buku_id: '', tanggal_pinjam: hariIni(), status: 'dipinjam' })

export const Peminjaman = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(formKosong)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [daftarSiswa, setDaftarSiswa] = useState([])
  const [daftarBuku, setDaftarBuku] = useState([])

  const [kembali, setKembali] = useState(null)
  const [tanggalKembali, setTanggalKembali] = useState(hariIni())
  const [memproses, setMemproses] = useState(false)

  const [hapus, setHapus] = useState(null)
  const [menghapus, setMenghapus] = useState(false)

  const { toast, tampilkan, tutup } = useToast()

  useEffect(() => {
    let dibatalkan = false

    const ambil = async () => {
      try {
        const rows = await peminjamanApi.list({ page, status: filter || undefined })
        if (dibatalkan) return
        setData(rows)
        setError('')
      } catch (err) {
        if (dibatalkan) return
        setError(pesanError(err))
        setData([])
      } finally {
        if (!dibatalkan) setLoading(false)
      }
    }

    ambil()

    return () => {
      dibatalkan = true
    }
  }, [page, filter, reload])

  const muatUlang = () => {
    setLoading(true)
    setReload((nilai) => nilai + 1)
  }

  const bukaTambah = async () => {
    setForm(formKosong())
    setFormError('')
    setFormOpen(true)
    try {
      const [siswa, buku] = await Promise.all([siswaApi.list({}), bukuApi.list({})])
      setDaftarSiswa(siswa)
      setDaftarBuku(buku)
    } catch (err) {
      setFormError(pesanError(err))
    }
  }

  const simpan = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await peminjamanApi.create({
        siswa_id: Number(form.siswa_id),
        buku_id: Number(form.buku_id),
        tanggal_pinjam: form.tanggal_pinjam,
        status: form.status,
      })
      tampilkan('Peminjaman berhasil dibuat')
      setFormOpen(false)
      setPage(1)
      muatUlang()
    } catch (err) {
      setFormError(pesanError(err))
    } finally {
      setSaving(false)
    }
  }

  const bukaKembali = (row) => {
    setKembali(row)
    setTanggalKembali(hariIni())
  }

  const prosesKembalikan = async (event) => {
    event.preventDefault()
    if (!kembali) return
    setMemproses(true)
    try {
      const hasil = await peminjamanApi.kembalikan(kembali.id, { tanggal_kembali: tanggalKembali })
      tampilkan(
        hasil.keterlambatan_hari > 0
          ? `Buku dikembalikan, terlambat ${hasil.keterlambatan_hari} hari`
          : 'Buku berhasil dikembalikan',
      )
      setKembali(null)
      muatUlang()
    } catch (err) {
      tampilkan(pesanError(err), 'err')
    } finally {
      setMemproses(false)
    }
  }

  const konfirmasiHapus = async () => {
    if (!hapus) return
    setMenghapus(true)
    try {
      await peminjamanApi.remove(hapus.id)
      tampilkan('Peminjaman berhasil dihapus')
      setHapus(null)
      muatUlang()
    } catch (err) {
      tampilkan(pesanError(err), 'err')
      setHapus(null)
    } finally {
      setMenghapus(false)
    }
  }

  return (
    <>
      <PageHeader title="Data Peminjaman" description="Catat peminjaman dan pengembalian buku siswa.">
        <button type="button" className={btnPrimary} onClick={bukaTambah}>
          <span className="text-base leading-none">+</span> Peminjaman Baru
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER.map((item) => (
          <button
            key={item.value || 'semua'}
            type="button"
            onClick={() => {
              setFilter(item.value)
              setPage(1)
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === item.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={tableWrapper}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Siswa</th>
                <th className="px-4 py-3 font-semibold">Buku</th>
                <th className="px-4 py-3 font-semibold">Tgl Pinjam</th>
                <th className="px-4 py-3 font-semibold">Tgl Kembali</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{row.siswa_nama}</p>
                    <p className="text-xs text-slate-500">{row.siswa_kelas}</p>
                  </td>
                  <td className="max-w-[16rem] px-4 py-3">
                    <p className="font-medium text-slate-900">{row.buku_judul}</p>
                    <p className="text-xs text-slate-500">{row.buku_penulis}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatTanggal(row.tanggal_pinjam)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatTanggal(row.tanggal_kembali)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {row.status === 'dipinjam' ? (
                        <button type="button" className={btnEdit} onClick={() => bukaKembali(row)}>
                          Kembalikan
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className={btnHapus}
                        onClick={() =>
                          setHapus({ id: row.id, buku: row.buku_judul, siswa: row.siswa_nama })
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 border-t border-slate-200 px-4 py-12 text-sm text-slate-500">
            <Spinner /> Memuat data peminjaman...
          </div>
        ) : error ? (
          <div className="border-t border-slate-200 px-4 py-12 text-center text-sm text-rose-600">
            {error}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title="Belum ada peminjaman"
            description={
              filter
                ? `Tidak ada peminjaman dengan status "${filter}".`
                : 'Buat peminjaman baru untuk mulai mencatat.'
            }
          />
        ) : (
          <Pagination page={page} setPage={setPage} count={data.length} limit={LIMIT} />
        )}
      </div>

      <Modal
        open={formOpen}
        title="Peminjaman Baru"
        description="Pilih siswa dan buku yang akan dipinjam."
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button type="button" className={btnSecondary} onClick={() => setFormOpen(false)}>
              Batal
            </button>
            <button type="submit" form="form-peminjaman" className={btnPrimary} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Peminjaman'}
            </button>
          </>
        }
      >
        <form id="form-peminjaman" onSubmit={simpan} className="space-y-4">
          <Field label="Siswa">
            <select
              required
              value={form.siswa_id}
              onChange={(event) => setForm({ ...form, siswa_id: event.target.value })}
              className={inputClass}
            >
              <option value="">Pilih siswa</option>
              {daftarSiswa.map((siswa) => (
                <option key={siswa.id} value={siswa.id}>
                  {siswa.nama} ({siswa.kelas})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Buku" hint="Buku dengan stok 0 tidak dapat dipinjam.">
            <select
              required
              value={form.buku_id}
              onChange={(event) => setForm({ ...form, buku_id: event.target.value })}
              className={inputClass}
            >
              <option value="">Pilih buku</option>
              {daftarBuku.map((buku) => (
                <option key={buku.id} value={buku.id} disabled={buku.stok <= 0}>
                  {buku.judul} — stok {buku.stok}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal Pinjam">
            <input
              type="date"
              required
              value={form.tanggal_pinjam}
              onChange={(event) => setForm({ ...form, tanggal_pinjam: event.target.value })}
              className={inputClass}
            />
          </Field>
          {formError ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
              {formError}
            </p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(kembali)}
        title="Kembalikan Buku"
        description={kembali ? `${kembali.buku_judul} — ${kembali.siswa_nama}` : ''}
        onClose={() => setKembali(null)}
        footer={
          <>
            <button type="button" className={btnSecondary} onClick={() => setKembali(null)}>
              Batal
            </button>
            <button type="submit" form="form-kembali" className={btnPrimary} disabled={memproses}>
              {memproses ? 'Memproses...' : 'Kembalikan'}
            </button>
          </>
        }
      >
        <form id="form-kembali" onSubmit={prosesKembalikan} className="space-y-4">
          <Field label="Tanggal Kembali" hint="Denda keterlambatan dihitung otomatis (lebih dari 7 hari).">
            <input
              type="date"
              required
              value={tanggalKembali}
              onChange={(event) => setTanggalKembali(event.target.value)}
              className={inputClass}
            />
          </Field>
          <p className="text-xs text-slate-500">Tanggal pinjam: {formatTanggal(kembali?.tanggal_pinjam)}</p>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(hapus)}
        title="Hapus peminjaman?"
        description={
          hapus
            ? `Catatan peminjaman "${hapus.buku}" oleh ${hapus.siswa} akan dihapus. Stok buku dikembalikan bila masih aktif.`
            : ''
        }
        loading={menghapus}
        onCancel={() => setHapus(null)}
        onConfirm={konfirmasiHapus}
      />

      <Toast toast={toast} onClose={tutup} />
    </>
  )
}
