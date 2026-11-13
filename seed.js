const pool = require('./db')

const kelasList = ['X-A', 'X-B', 'XI-A', 'XI-B', 'XII-A', 'XII-B']
const namaDepan = ['Budi', 'Siti', 'Andi', 'Dewi', 'Rizki', 'Putri', 'Agus', 'Nina']
const namaBelakang = ['Santoso', 'Wijaya', 'Pratama', 'Lestari', 'Hidayat', 'Saputra']

const bukuList = [
  {
    judul: 'Laskar Pelangi',
    penulis: 'Andrea Hirata',
    penerbit: 'Bentang Pustaka',
    tahun_terbit: 2005,
    isbn: '9793062795',
    stok: 10
  },
  {
    judul: 'Bumi Manusia',
    penulis: 'Pramoedya Ananta Toer',
    penerbit: 'Hasta Mitra',
    tahun_terbit: 1980,
    isbn: '9799731210',
    stok: 5
  },
  {
    judul: 'Perahu Kertas',
    penulis: 'Dewi Lestari',
    penerbit: 'Truedee Books',
    tahun_terbit: 2009,
    isbn: '9792554217',
    stok: 8
  },
  {
    judul: 'Dilan: Dia adalah Dilanku 1990',
    penulis: 'Pidi Baiq',
    penerbit: 'Pastel Books',
    tahun_terbit: 2014,
    isbn: '6022200700',
    stok: 12
  },
  {
    judul: 'Fisika untuk SMA Kelas X',
    penulis: 'Sri Handayani',
    penerbit: 'Erlangga',
    tahun_terbit: 2020,
    isbn: '9786024342345',
    stok: 20
  },
  {
    judul: 'Matematika Diskrit',
    penulis: 'Rinaldi Munir',
    penerbit: 'Informatika Bandung',
    tahun_terbit: 2018,
    isbn: '9786021518023',
    stok: 15
  },
  {
    judul: 'Pemrograman Python',
    penulis: 'Indra Gunawan',
    penerbit: 'Elex Media Komputindo',
    tahun_terbit: 2021,
    isbn: '9786020456025',
    stok: 7
  },
  {
    judul: 'Kamus Bahasa Indonesia',
    penulis: 'Tim Penyusun KBBI',
    penerbit: 'Pusat Bahasa',
    tahun_terbit: 2020,
    isbn: '9786024379181',
    stok: 25
  }
]

const acak = (arr) => arr[Math.floor(Math.random() * arr.length)]
const tanggalAcak = () => {
  const start = new Date(2023, 0, 1)
  const end = new Date()
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return randomDate.toISOString().split('T')[0]
}

const seedSiswa = async () => {
  const total = 100
  const batch = 20

  for (let i = 0; i < total; i += batch) {
    const rows = []
    for (let j = 0; j < batch; j++) {
      rows.push([`${acak(namaDepan)} ${acak(namaBelakang)} ${i + j}`, acak(kelasList)])
    }
    await pool.query('INSERT IGNORE INTO siswa (nama, kelas) VALUES ?', [rows])
    console.log(`Siswa: ${i + batch} data masuk`)
  }
}

const seedBuku = async () => {
  for (const buku of bukuList) {
    await pool.query(
      'INSERT IGNORE INTO buku (judul, penulis, penerbit, tahun_terbit, isbn, stok) VALUES (?, ?, ?, ?, ?, ?)',
      [buku.judul, buku.penulis, buku.penerbit, buku.tahun_terbit, buku.isbn, buku.stok]
    )
    console.log(`Buku "${buku.judul}" ditambahkan`)
  }
}

const seedPeminjaman = async () => {
  const [siswa] = await pool.query('SELECT id FROM siswa LIMIT 50')
  const [buku] = await pool.query('SELECT id FROM buku')
  
  if (siswa.length === 0 || buku.length === 0) {
    console.log('Data siswa atau buku kosong, skip peminjaman')
    return
  }
  
  const total = 30
  
  for (let i = 0; i < total; i++) {
    const siswa_id = acak(siswa).id
    const buku_id = acak(buku).id
    const tanggal_pinjam = tanggalAcak()
    const status = acak(['dipinjam', 'dikembalikan', 'terlambat'])
    const tanggal_kembali = status !== 'dipinjam' ? tanggalAcak() : null
    
    try {
      await pool.query(
        'INSERT IGNORE INTO peminjaman (siswa_id, buku_id, tanggal_pinjam, tanggal_kembali, status) VALUES (?, ?, ?, ?, ?)',
        [siswa_id, buku_id, tanggal_pinjam, tanggal_kembali, status]
      )
      
      // Update stok buku jika dipinjam
      if (status === 'dipinjam') {
        await pool.query('UPDATE buku SET stok = stok - 1 WHERE id = ?', [buku_id])
      }
      
      console.log(`Peminjaman ke-${i + 1} ditambahkan`)
    } catch (error) {
      console.log(`Error menambahkan peminjaman ${i + 1}:`, error.message)
    }
  }
}

const main = async () => {
  try {
    console.log('Memulai seeding database...')
    
    console.log('\n--- Seeding Siswa ---')
    await seedSiswa()
    
    console.log('\n--- Seeding Buku ---')
    await seedBuku()
    
    console.log('\n--- Seeding Peminjaman ---')
    await seedPeminjaman()
    
    console.log('\n--- Seeding Selesai ---')
    
    // Tampilkan statistik
    const [totalSiswa] = await pool.query('SELECT COUNT(*) as total FROM siswa')
    const [totalBuku] = await pool.query('SELECT COUNT(*) as total FROM buku')
    const [totalPeminjaman] = await pool.query('SELECT COUNT(*) as total FROM peminjaman')
    
    console.log('\nStatistik Database:')
    console.log(`- Total Siswa: ${totalSiswa[0].total}`)
    console.log(`- Total Buku: ${totalBuku[0].total}`)
    console.log(`- Total Peminjaman: ${totalPeminjaman[0].total}`)
    
  } catch (error) {
    console.error('Error saat seeding:', error)
  } finally {
    await pool.end()
    console.log('\nKoneksi database ditutup')
  }
}

main()