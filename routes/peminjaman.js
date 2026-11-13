const express = require('express')
const pool = require('../db')

const router = express.Router()

const validasiPeminjaman = (body) => {
  const siswa_id = parseInt(body.siswa_id)
  const buku_id = parseInt(body.buku_id)
  const tanggal_pinjam = body.tanggal_pinjam
  const status = body.status
  
  if (
    isNaN(siswa_id) || siswa_id <= 0 ||
    isNaN(buku_id) || buku_id <= 0 ||
    !tanggal_pinjam || !Date.parse(tanggal_pinjam)
  ) return null
  
  const validStatus = ['dipinjam', 'dikembalikan', 'terlambat']
  const finalStatus = validStatus.includes(status) ? status : 'dipinjam'
  
  return { siswa_id, buku_id, tanggal_pinjam, status: finalStatus }
}

router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = 50
  const offset = (page - 1) * limit
  const status = req.query.status || ''

  try {
    let query = `
      SELECT 
        p.id,
        p.siswa_id,
        s.nama as siswa_nama,
        s.kelas as siswa_kelas,
        p.buku_id,
        b.judul as buku_judul,
        b.penulis as buku_penulis,
        p.tanggal_pinjam,
        p.tanggal_kembali,
        p.status,
        p.created_at,
        p.updated_at
      FROM peminjaman p
      INNER JOIN siswa s ON p.siswa_id = s.id
      INNER JOIN buku b ON p.buku_id = b.id
    `
    let params = []
    
    if (status && ['dipinjam', 'dikembalikan', 'terlambat'].includes(status)) {
      query += ' WHERE p.status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY p.tanggal_pinjam DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)
    
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (error) {
    console.error('Error mengambil data peminjaman:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat mengambil data peminjaman' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        p.id,
        p.siswa_id,
        s.nama as siswa_nama,
        s.kelas as siswa_kelas,
        p.buku_id,
        b.judul as buku_judul,
        b.penulis as buku_penulis,
        p.tanggal_pinjam,
        p.tanggal_kembali,
        p.status,
        p.created_at,
        p.updated_at
      FROM peminjaman p
      INNER JOIN siswa s ON p.siswa_id = s.id
      INNER JOIN buku b ON p.buku_id = b.id
      WHERE p.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ pesan: 'Peminjaman tidak ditemukan' })
    res.json(rows[0])
  } catch (error) {
    console.error('Error mengambil detail peminjaman:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat mengambil detail peminjaman' })
  }
})

router.post('/', async (req, res) => {
  const data = validasiPeminjaman(req.body)
  if (!data) return res.status(400).json({ pesan: 'Data peminjaman tidak valid' })

  try {
    // Cek apakah siswa dan buku ada
    const [siswaRows] = await pool.query('SELECT id FROM siswa WHERE id = ?', [data.siswa_id])
    if (siswaRows.length === 0) return res.status(404).json({ pesan: 'Siswa tidak ditemukan' })
    
    const [bukuRows] = await pool.query('SELECT id, stok FROM buku WHERE id = ?', [data.buku_id])
    if (bukuRows.length === 0) return res.status(404).json({ pesan: 'Buku tidak ditemukan' })
    
    if (bukuRows[0].stok <= 0) return res.status(400).json({ pesan: 'Stok buku habis' })
    
    // Kurangi stok buku
    await pool.query('UPDATE buku SET stok = stok - 1 WHERE id = ?', [data.buku_id])
    
    const [result] = await pool.query(
      'INSERT INTO peminjaman (siswa_id, buku_id, tanggal_pinjam, status) VALUES (?, ?, ?, ?)',
      [data.siswa_id, data.buku_id, data.tanggal_pinjam, data.status]
    )
    
    res.status(201).json({ 
      id: result.insertId, 
      ...data,
      pesan: 'Peminjaman berhasil dibuat'
    })
  } catch (error) {
    console.error('Error menambahkan peminjaman:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat menambahkan peminjaman' })
  }
})

router.put('/:id/kembalikan', async (req, res) => {
  try {
    const tanggal_kembali = req.body.tanggal_kembali || new Date().toISOString().split('T')[0]
    
    if (!Date.parse(tanggal_kembali)) {
      return res.status(400).json({ pesan: 'Tanggal kembali tidak valid' })
    }
    
    // Ambil data peminjaman
    const [peminjamanRows] = await pool.query(
      'SELECT buku_id, tanggal_pinjam FROM peminjaman WHERE id = ? AND status = "dipinjam"',
      [req.params.id]
    )
    
    if (peminjamanRows.length === 0) {
      return res.status(404).json({ pesan: 'Peminjaman aktif tidak ditemukan' })
    }
    
    const { buku_id, tanggal_pinjam } = peminjamanRows[0]
    const tanggalKembaliDate = new Date(tanggal_kembali)
    const tanggalPinjamDate = new Date(tanggal_pinjam)
    const diffDays = Math.floor((tanggalKembaliDate - tanggalPinjamDate) / (1000 * 60 * 60 * 24))
    const status = diffDays > 7 ? 'terlambat' : 'dikembalikan'
    
    // Update status peminjaman dan tanggal kembali
    await pool.query(
      'UPDATE peminjaman SET tanggal_kembali = ?, status = ? WHERE id = ?',
      [tanggal_kembali, status, req.params.id]
    )
    
    // Tambah stok buku
    await pool.query('UPDATE buku SET stok = stok + 1 WHERE id = ?', [buku_id])
    
    res.json({ 
      pesan: 'Buku berhasil dikembalikan',
      tanggal_kembali,
      status,
      keterlambatan_hari: diffDays > 7 ? diffDays - 7 : 0
    })
  } catch (error) {
    console.error('Error mengembalikan buku:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat mengembalikan buku' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    // Cek apakah peminjaman masih aktif
    const [peminjamanRows] = await pool.query(
      'SELECT buku_id FROM peminjaman WHERE id = ? AND status = "dipinjam"',
      [req.params.id]
    )
    
    const [result] = await pool.query('DELETE FROM peminjaman WHERE id = ?', [req.params.id])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ pesan: 'Peminjaman tidak ditemukan' })
    }
    
    // Jika peminjaman aktif dihapus, kembalikan stok buku
    if (peminjamanRows.length > 0) {
      await pool.query('UPDATE buku SET stok = stok + 1 WHERE id = ?', [peminjamanRows[0].buku_id])
    }
    
    res.json({ pesan: 'Peminjaman dihapus' })
  } catch (error) {
    console.error('Error menghapus peminjaman:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat menghapus peminjaman' })
  }
})

// Endpoint untuk laporan peminjaman
router.get('/laporan/statistik', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_peminjaman,
        SUM(CASE WHEN status = 'dipinjam' THEN 1 ELSE 0 END) as sedang_dipinjam,
        SUM(CASE WHEN status = 'dikembalikan' THEN 1 ELSE 0 END) as sudah_dikembalikan,
        SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) as terlambat
      FROM peminjaman
    `)
    
    const [populer] = await pool.query(`
      SELECT 
        b.id,
        b.judul,
        COUNT(p.id) as jumlah_peminjaman
      FROM buku b
      LEFT JOIN peminjaman p ON b.id = p.buku_id
      GROUP BY b.id
      ORDER BY jumlah_peminjaman DESC
      LIMIT 5
    `)
    
    res.json({
      statistik: stats[0],
      buku_terpopuler: populer
    })
  } catch (error) {
    console.error('Error mengambil statistik:', error)
    res.status(500).json({ pesan: 'Terjadi kesalahan saat mengambil statistik' })
  }
})

module.exports = router