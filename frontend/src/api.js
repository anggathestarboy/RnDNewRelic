import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

export function pesanError(error) {
  return (
    error?.response?.data?.pesan ||
    (error?.request ? 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.' : error?.message) ||
    'Terjadi kesalahan'
  )
}

const daftar = (url) => (params = {}) => api.get(url, { params }).then((res) => res.data)

export const siswaApi = {
  list: daftar('/siswa'),
  detail: (id) => api.get(`/siswa/${id}`).then((res) => res.data),
  create: (data) => api.post('/siswa', data).then((res) => res.data),
  update: (id, data) => api.put(`/siswa/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/siswa/${id}`).then((res) => res.data),
}

export const bukuApi = {
  list: daftar('/buku'),
  detail: (id) => api.get(`/buku/${id}`).then((res) => res.data),
  create: (data) => api.post('/buku', data).then((res) => res.data),
  update: (id, data) => api.put(`/buku/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/buku/${id}`).then((res) => res.data),
}

export const peminjamanApi = {
  list: daftar('/peminjaman'),
  detail: (id) => api.get(`/peminjaman/${id}`).then((res) => res.data),
  create: (data) => api.post('/peminjaman', data).then((res) => res.data),
  kembalikan: (id, data) => api.put(`/peminjaman/${id}/kembalikan`, data).then((res) => res.data),
  remove: (id) => api.delete(`/peminjaman/${id}`).then((res) => res.data),
  statistik: () => api.get('/peminjaman/laporan/statistik').then((res) => res.data),
}

export default api
