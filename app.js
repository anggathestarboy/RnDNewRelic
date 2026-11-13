const express = require('express')
const siswaRoutes = require('./routes/siswa')
const bukuRoutes = require('./routes/buku')
const peminjamanRoutes = require('./routes/peminjaman')

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ 
    pesan: 'API Peminjaman Buku Sekolah',
    endpoints: {
      siswa: '/api/siswa',
      buku: '/api/buku',
      peminjaman: '/api/peminjaman'
    }
  })
})

app.use('/api/siswa', siswaRoutes)
app.use('/api/buku', bukuRoutes)
app.use('/api/peminjaman', peminjamanRoutes)

app.get('/api/error', () => {
  throw new Error('Error buatan untuk tes New Relic')
})

app.use((req, res) => {
  res.status(404).json({ pesan: 'Endpoint tidak ditemukan' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ pesan: 'Terjadi kesalahan pada server' })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server jalan di http://localhost:${port}`)
  console.log('API Peminjaman Buku Sekolah siap digunakan!')
})