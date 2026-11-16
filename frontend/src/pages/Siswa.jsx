import { useEffect, useState } from 'react'
import { pesanError, siswaApi } from '../api'
import Modal from '../components/Modal'
import { ConfirmDialog, EmptyState, Field, PageHeader, Pagination, Spinner, Toast, btnEdit, btnHapus, btnPrimary, btnSecondary, inputClass, tableWrapper } from '../components/ui'
import useDebounce from '../hooks/useDebounce'
import useToast from '../hooks/useToast'

const LIMIT = 50
const formKosong = { nama: '', kelas: '' }

export const Siswa = () => {
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
        const rows = await siswaApi.list({ page, q })
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
    setForm({ nama: row.nama, kelas: row.kelas })
    setFormError('')
    setFormOpen(true)
  }

  const simpan = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editId) {
        await siswaApi.update(editId, form)
        tampilkan('Data siswa berhasil diperbarui')
      } else {
        await siswaApi.create(form)
        tampilkan('Siswa baru berhasil ditambahkan')
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
      await siswaApi.remove(hapus.id)
      tampilkan('Siswa berhasil dihapus')
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
      <PageHeader title="Data Siswa" description="Kelola daftar siswa yang dapat meminjam buku.">
        <button type="button" className={btnPrimary} onClick={bukaTambah}>
          <span className="text-base leading-none">+</span> Tambah Siswa
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
            placeholder="Cari nama siswa..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      <div className={tableWrapper}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-16 px-4 py-3 font-semibold">No</th>
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Kelas</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, index) => (
                <tr key={row.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-slate-400">{(page - 1) * LIMIT + index + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.nama}</td>
                  <td className="px-4 py-3 text-slate-600">{row.kelas}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" className={btnEdit} onClick={() => bukaEdit(row)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className={btnHapus}
                        onClick={() => setHapus({ id: row.id, nama: row.nama })}
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
            <Spinner /> Memuat data siswa...
          </div>
        ) : error ? (
          <div className="border-t border-slate-200 px-4 py-12 text-center text-sm text-rose-600">
            {error}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title={q ? 'Siswa tidak ditemukan' : 'Belum ada data siswa'}
            description={q ? `Tidak ada hasil untuk "${q}".` : 'Tambahkan siswa pertama untuk mulai meminjamkan buku.'}
          />
        ) : (
          <Pagination page={page} setPage={setPage} count={data.length} limit={LIMIT} />
        )}
      </div>

      <Modal
        open={formOpen}
        title={editId ? 'Edit Siswa' : 'Tambah Siswa'}
        description={editId ? 'Perbarui data siswa.' : 'Masukkan data siswa baru.'}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button type="button" className={btnSecondary} onClick={() => setFormOpen(false)}>
              Batal
            </button>
            <button type="submit" form="form-siswa" className={btnPrimary} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="form-siswa" onSubmit={simpan} className="space-y-4">
          <Field label="Nama Siswa">
            <input
              type="text"
              required
              maxLength={100}
              value={form.nama}
              onChange={(event) => setForm({ ...form, nama: event.target.value })}
              placeholder="Contoh: Budi Santoso"
              className={inputClass}
            />
          </Field>
          <Field label="Kelas" hint="Maksimal 20 karakter, contoh: X-A atau XII IPA 2">
            <input
              type="text"
              required
              maxLength={20}
              value={form.kelas}
              onChange={(event) => setForm({ ...form, kelas: event.target.value })}
              placeholder="Contoh: XI-A"
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

      <ConfirmDialog
        open={Boolean(hapus)}
        title="Hapus siswa?"
        description={hapus ? `Data "${hapus.nama}" akan dihapus permanen, termasuk riwayat peminjamannya.` : ''}
        loading={menghapus}
        onCancel={() => setHapus(null)}
        onConfirm={konfirmasiHapus}
      />

      <Toast toast={toast} onClose={tutup} />
    </>
  )
}
