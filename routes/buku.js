const express = require('express')
const pool = require('../db')

const router = express.Router()

const validasiBuku = (body) => {
  const judul = typeof body.judul === 'string' ? body.judul.trim() : ''
  const penulis = typeof body.penulis === 'string' ? body.penulis.trim() : ''
  const penerbit = typeof body.penerbit === 'string' ? body.penerbit.trim() : ''
  const tahun_terbit = parseInt(body.tahun_terbit)
  const isbn = typeof body.isbn === 'string' ? body.isbn.trim() : ''
  const stok = parseInt(body.stok)
  
  if (
    !judul || !penulis || !penerbit || 
    isNaN(tahun_terbit) || tahun_terbit < 1900 || tahun_terbit > new Date().getFullYear() ||
    isNaN(stok) || stok < 0
  ) return null
  
  return { judul, penulis, penerbit, tahun_terbit, isbn, stok }
}

router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = 50
  const offset = (page - 1) * limit
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

  try {
    if (q) {
      const [rows] = await pool.query(
        `SELECT id, judul, penulis, penerbit, tahun_terbit, isbn, stok 
         FROM buku 
         WHERE judul LIKE ? OR penulis LIKE ? OR isbn LIKE ?
         ORDER BY id DESC LIMIT ? OFFSET ?`,
        [`%${q}%`, `%${q}%`, `%${q}%`, limit, offset]
      )
      return res.json(rows)
    }

    const [rows] = await pool.query(
      `SELECT id, judul, penulis, penerbit, tahun_terbit, isbn, stok 
       FROM buku 
       ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error mengambil data buku:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat mengambil data buku' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, judul, penulis, penerbit, tahun_terbit, isbn, stok 
       FROM buku 
       WHERE id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ pesan: 'Buku tidak ditemukan' })
    res.json(rows[0])
  } catch (error) {
    console.error('Error mengambil detail buku:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat mengambil detail buku' })
  }
})

router.post('/', async (req, res) => {
  const data = validasiBuku(req.body)
  if (!data) return res.status(400).json({ pesan: 'Data buku tidak valid' })

  try {
    const [result] = await pool.query(
      'INSERT INTO buku (judul, penulis, penerbit, tahun_terbit, isbn, stok) VALUES (?, ?, ?, ?, ?, ?)',
      [data.judul, data.penulis, data.penerbit, data.tahun_terbit, data.isbn || null, data.stok]
    )
    res.status(201).json({ id: result.insertId, ...data })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ pesan: 'ISBN sudah terdaftar' })
    }
    console.error('Error menambahkan buku:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat menambahkan buku' })
  }
})

router.put('/:id', async (req, res) => {
  const data = validasiBuku(req.body)
  if (!data) return res.status(400).json({ pesan: 'Data buku tidak valid' })

  try {
    const [result] = await pool.query(
      `UPDATE buku 
       SET judul = ?, penulis = ?, penerbit = ?, tahun_terbit = ?, isbn = ?, stok = ? 
       WHERE id = ?`,
      [data.judul, data.penulis, data.penerbit, data.tahun_terbit, data.isbn || null, data.stok, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ pesan: 'Buku tidak ditemukan' })
    res.json({ id: Number(req.params.id), ...data })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ pesan: 'ISBN sudah terdaftar' })
    }
    console.error('Error mengupdate buku:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat mengupdate buku' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM buku WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ pesan: 'Buku tidak ditemukan' })
    res.json({ pesan: 'Buku dihapus' })
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ pesan: 'Buku tidak dapat dihapus karena masih ada peminjaman aktif' })
    }
    console.error('Error menghapus buku:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat menghapus buku' })
  }
})

module.exports = router