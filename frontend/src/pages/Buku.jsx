import { useEffect, useState } from 'react'
import { bukuApi, pesanError } from '../api'
import Modal from '../components/Modal'
import { ConfirmDialog, EmptyState, Field, PageHeader, Pagination, Spinner, StokBadge, Toast, btnEdit, btnHapus, btnPrimary, btnSecondary, inputClass, tableWrapper } from '../components/ui'
import useDebounce from '../hooks/useDebounce'
import useToast from '../hooks/useToast'

const LIMIT = 50
const TAHUN_INI = new Date().getFullYear()
const formKosong = {
  judul: '',
  penulis: '',
  penerbit: '',
  tahun_terbit: TAHUN_INI,
  isbn: '',
  stok: 0,
}

export const Buku = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pencarian, setPencarian] = useState('')
  const q = useDebounce(pencarian)
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(formKosong)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [hapus, setHapus] = useState(null)
  const [menghapus, setMenghapus] = useState(false)

  const { toast, tampilkan, tutup } = useToast()

  useEffect(() => {
    let dibatalkan = false

    const ambil = async () => {
      try {
        const rows = await bukuApi.list({ page, q })
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
  }, [page, q, reload])

  const muatUlang = () => {
    setLoading(true)
    setReload((nilai) => nilai + 1)
  }

  const bukaTambah = () => {
    setEditId(null)
    setForm(formKosong)
    setFormError('')
    setFormOpen(true)
  }

  const bukaEdit = (row) => {
    setEditId(row.id)
    setForm({
      judul: row.judul,
      penulis: row.penulis,
      penerbit: row.penerbit,
      tahun_terbit: row.tahun_terbit,
      isbn: row.isbn || '',
      stok: row.stok,
    })
    setFormError('')
    setFormOpen(true)
  }

  const simpan = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        ...form,
        tahun_terbit: Number(form.tahun_terbit),
        stok: Number(form.stok),
      }
      if (editId) {
        await bukuApi.update(editId, payload)
        tampilkan('Data buku berhasil diperbarui')
      } else {
        await bukuApi.create(payload)
        tampilkan('Buku baru berhasil ditambahkan')
        setPage(1)
      }
      setFormOpen(false)
      muatUlang()
    } catch (err) {
      setFormError(pesanError(err))
    } finally {
      setSaving(false)
    }
  }

  const konfirmasiHapus = async () => {
    if (!hapus) return
    setMenghapus(true)
    try {
      await bukuApi.remove(hapus.id)
      tampilkan('Buku berhasil dihapus')
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
      <PageHeader title="Data Buku" description="Kelola koleksi buku beserta stok yang tersedia.">
        <button type="button" className={btnPrimary} onClick={bukaTambah}>
          <span className="text-base leading-none">+</span> Tambah Buku
        </button>
      </PageHeader>

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4 4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={pencarian}
            onChange={(event) => {
              setPencarian(event.target.value)
              setPage(1)
            }}
            placeholder="Cari judul, penulis, atau ISBN..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      <div className={tableWrapper}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Judul</th>
                <th className="px-4 py-3 font-semibold">Penulis</th>
                <th className="px-4 py-3 font-semibold">Penerbit</th>
                <th className="px-4 py-3 font-semibold">Tahun</th>
                <th className="px-4 py-3 font-semibold">ISBN</th>
                <th className="px-4 py-3 font-semibold">Stok</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/70">
                  <td className="max-w-[18rem] px-4 py-3 font-medium text-slate-900">{row.judul}</td>
                  <td className="px-4 py-3 text-slate-600">{row.penulis}</td>
                  <td className="px-4 py-3 text-slate-600">{row.penerbit}</td>
                  <td className="px-4 py-3 text-slate-600">{row.tahun_terbit}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.isbn || '-'}</td>
                  <td className="px-4 py-3">
                    <StokBadge stok={row.stok} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" className={btnEdit} onClick={() => bukaEdit(row)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className={btnHapus}
                        onClick={() => setHapus({ id: row.id, judul: row.judul })}
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
            <Spinner /> Memuat data buku...
          </div>
        ) : error ? (
          <div className="border-t border-slate-200 px-4 py-12 text-center text-sm text-rose-600">
            {error}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title={q ? 'Buku tidak ditemukan' : 'Belum ada data buku'}
            description={q ? `Tidak ada hasil untuk "${q}".` : 'Tambahkan buku pertama ke koleksi perpustakaan.'}
          />
        ) : (
          <Pagination page={page} setPage={setPage} count={data.length} limit={LIMIT} />
        )}
      </div>

      <Modal
        open={formOpen}
        size="lg"
        title={editId ? 'Edit Buku' : 'Tambah Buku'}
        description={editId ? 'Perbarui detail buku.' : 'Masukkan detail buku baru.'}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button type="button" className={btnSecondary} onClick={() => setFormOpen(false)}>
              Batal
            </button>
            <button type="submit" form="form-buku" className={btnPrimary} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="form-buku" onSubmit={simpan} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Judul Buku">
              <input
                type="text"
                required
                maxLength={200}
                value={form.judul}
                onChange={(event) => setForm({ ...form, judul: event.target.value })}
                placeholder="Contoh: Laskar Pelangi"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Penulis">
            <input
              type="text"
              required
              maxLength={100}
              value={form.penulis}
              onChange={(event) => setForm({ ...form, penulis: event.target.value })}
              placeholder="Contoh: Andrea Hirata"
              className={inputClass}
            />
          </Field>
          <Field label="Penerbit">
            <input
              type="text"
              required
              maxLength={100}
              value={form.penerbit}
              onChange={(event) => setForm({ ...form, penerbit: event.target.value })}
              placeholder="Contoh: Bentang Pustaka"
              className={inputClass}
            />
          </Field>
          <Field label="Tahun Terbit">
            <input
              type="number"
              required
              min={1900}
              max={TAHUN_INI}
              value={form.tahun_terbit}
              onChange={(event) => setForm({ ...form, tahun_terbit: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Stok">
            <input
              type="number"
              required
              min={0}
              value={form.stok}
              onChange={(event) => setForm({ ...form, stok: event.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="ISBN" hint="Opsional, tetapi tidak boleh sama dengan buku lain.">
              <input
                type="text"
                maxLength={20}
                value={form.isbn}
                onChange={(event) => setForm({ ...form, isbn: event.target.value })}
                placeholder="Contoh: 9789792254657"
                className={inputClass}
              />
            </Field>
          </div>
          {formError ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200 sm:col-span-2">
              {formError}
            </p>
          ) : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(hapus)}
        title="Hapus buku?"
        description={hapus ? `Buku "${hapus.judul}" akan dihapus permanen.` : ''}
        loading={menghapus}
        onCancel={() => setHapus(null)}
        onConfirm={konfirmasiHapus}
      />

      <Toast toast={toast} onClose={tutup} />
    </>
  )
}
