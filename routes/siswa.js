const express = require('express')
const pool = require('../db')

const router = express.Router()

const validasi = (body) => {
  const nama = typeof body.nama === 'string' ? body.nama.trim() : ''
  const kelas = typeof body.kelas === 'string' ? body.kelas.trim() : ''
  if (!nama || !kelas || nama.length > 100 || kelas.length > 20) return null
  return { nama, kelas }
}

router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = 50
  const offset = (page - 1) * limit
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

  if (q) {
    const [rows] = await pool.query(
      'SELECT id, nama, kelas FROM siswa WHERE nama LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [`%${q}%`, limit, offset]
    )
    return res.json(rows)
  }

  const [rows] = await pool.query(
    'SELECT id, nama, kelas FROM siswa ORDER BY id DESC LIMIT ? OFFSET ?',
    [limit, offset]
  )
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT id, nama, kelas FROM siswa WHERE id = ?', [req.params.id])
  if (rows.length === 0) return res.status(404).json({ pesan: 'Siswa tidak ditemukan' })
  res.json(rows[0])
})

router.post('/', async (req, res) => {
  const data = validasi(req.body)
  if (!data) return res.status(400).json({ pesan: 'Nama dan kelas wajib diisi' })

  const [result] = await pool.query('INSERT INTO siswa (nama, kelas) VALUES (?, ?)', [data.nama, data.kelas])
  res.status(201).json({ id: result.insertId, ...data })
})

router.put('/:id', async (req, res) => {
  const data = validasi(req.body)
  if (!data) return res.status(400).json({ pesan: 'Nama dan kelas wajib diisi' })

  const [result] = await pool.query('UPDATE siswa SET nama = ?, kelas = ? WHERE id = ?', [
    data.nama,
    data.kelas,
    req.params.id,
  ])
  if (result.affectedRows === 0) return res.status(404).json({ pesan: 'Siswa tidak ditemukan' })
  res.json({ id: Number(req.params.id), ...data })
})

router.delete('/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM siswa WHERE id = ?', [req.params.id])
  if (result.affectedRows === 0) return res.status(404).json({ pesan: 'Siswa tidak ditemukan' })
  res.json({ pesan: 'Siswa dihapus' })
})

module.exports = router