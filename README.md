# Sistem Manajemen Informasi Peminjaman Buku

Sistem manajemen informasi peminjaman buku sederhana yang dibangun dengan Express.js dan MySQL.

## Fitur

- Manajemen data siswa
- Manajemen data buku
- Manajemen peminjaman buku
- Pelacakan status peminjaman (dipinjam, dikembalikan, terlambat)
- Laporan dan statistik peminjaman
- Validasi stok buku otomatis

## Struktur Database

### Tabel Siswa
```
id           : INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
nama         : VARCHAR(100) NOT NULL
kelas        : VARCHAR(20) NOT NULL
```

### Tabel Buku
```
id           : INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
judul        : VARCHAR(200) NOT NULL
penulis      : VARCHAR(100) NOT NULL
penerbit     : VARCHAR(100) NOT NULL
tahun_terbit : YEAR NOT NULL
isbn         : VARCHAR(20) UNIQUE
stok         : INT UNSIGNED NOT NULL DEFAULT 0
created_at   : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at   : TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### Tabel Peminjaman
```
id              : INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
siswa_id        : INT UNSIGNED NOT NULL
buku_id         : INT UNSIGNED NOT NULL
tanggal_pinjam  : DATE NOT NULL
tanggal_kembali : DATE
status          : ENUM('dipinjam', 'dikembalikan', 'terlambat') NOT NULL DEFAULT 'dipinjam'
created_at      : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      : TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## Instalasi

1. Clone repository
2. Install dependencies:
```bash
npm install
```

3. Konfigurasi database di file `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=nr_siswa
PORT=3000
```

4. Jalankan schema database:
```bash
mysql -u root -p < schema.sql
```

5. Seed data awal:
```bash
npm run seed
```

6. Jalankan aplikasi:
```bash
npm run dev
```

## Dokumentasi API

### Base URL: `http://localhost:3000/api`

---

### **Siswa API**

#### 1. **GET /siswa** - Daftar siswa
**Query Parameters:**
- `page`: Halaman (default: 1)
- `q`: Kata kunci pencarian (nama)

**Response:**
```json
[
  {
    "id": 1,
    "nama": "Budi Santoso 0",
    "kelas": "X-A"
  }
]
```

#### 2. **GET /siswa/:id** - Detail siswa
**Response:**
```json
{
  "id": 1,
  "nama": "Budi Santoso 0",
  "kelas": "X-A"
}
```

#### 3. **POST /siswa** - Tambah siswa
**Request Body:**
```json
{
  "nama": "John Doe",
  "kelas": "XII-A"
}
```

**Response:**
```json
{
  "id": 101,
  "nama": "John Doe",
  "kelas": "XII-A"
}
```

#### 4. **PUT /siswa/:id** - Update siswa
**Request Body:**
```json
{
  "nama": "John Doe Updated",
  "kelas": "XII-B"
}
```

**Response:**
```json
{
  "id": 101,
  "nama": "John Doe Updated",
  "kelas": "XII-B"
}
```

#### 5. **DELETE /siswa/:id** - Hapus siswa
**Response:**
```json
{
  "pesan": "Siswa dihapus"
}
```

---

### **Buku API**

#### 1. **GET /buku** - Daftar buku
**Query Parameters:**
- `page`: Halaman (default: 1)
- `q`: Kata kunci pencarian (judul, penulis, ISBN)

**Response:**
```json
[
  {
    "id": 1,
    "judul": "Laskar Pelangi",
    "penulis": "Andrea Hirata",
    "penerbit": "Bentang Pustaka",
    "tahun_terbit": 2005,
    "isbn": "9793062795",
    "stok": 10
  }
]
```

#### 2. **GET /buku/:id** - Detail buku
**Response:**
```json
{
  "id": 1,
  "judul": "Laskar Pelangi",
  "penulis": "Andrea Hirata",
  "penerbit": "Bentang Pustaka",
  "tahun_terbit": 2005,
  "isbn": "9793062795",
  "stok": 10
}
```

#### 3. **POST /buku** - Tambah buku
**Request Body:**
```json
{
  "judul": "Negeri 5 Menara",
  "penulis": "Ahmad Fuadi",
  "penerbit": "Gramedia Pustaka Utama",
  "tahun_terbit": 2009,
  "isbn": "9789792254657",
  "stok": 15
}
```

**Response:**
```json
{
  "id": 9,
  "judul": "Negeri 5 Menara",
  "penulis": "Ahmad Fuadi",
  "penerbit": "Gramedia Pustaka Utama",
  "tahun_terbit": 2009,
  "isbn": "9789792254657",
  "stok": 15
}
```

#### 4. **PUT /buku/:id** - Update buku
**Request Body:**
```json
{
  "judul": "Laskar Pelangi (Revised)",
  "penulis": "Andrea Hirata",
  "penerbit": "Bentang Pustaka",
  "tahun_terbit": 2006,
  "isbn": "9793062795",
  "stok": 12
}
```

**Response:**
```json
{
  "id": 1,
  "judul": "Laskar Pelangi (Revised)",
  "penulis": "Andrea Hirata",
  "penerbit": "Bentang Pustaka",
  "tahun_terbit": 2006,
  "isbn": "9793062795",
  "stok": 12
}
```

#### 5. **DELETE /buku/:id** - Hapus buku
**Response:**
```json
{
  "pesan": "Buku dihapus"
}
```

---

### **Peminjaman API**

#### 1. **GET /peminjaman** - Daftar peminjaman
**Query Parameters:**
- `page`: Halaman (default: 1)
- `status`: Filter status (dipinjam, dikembalikan, terlambat)

**Response:**
```json
[
  {
    "id": 1,
    "siswa_id": 10,
    "siswa_nama": "Budi Santoso 9",
    "siswa_kelas": "XI-A",
    "buku_id": 3,
    "buku_judul": "Perahu Kertas",
    "buku_penulis": "Dewi Lestari",
    "tanggal_pinjam": "2023-05-15",
    "tanggal_kembali": "2023-05-22",
    "status": "dikembalikan"
  }
]
```

#### 2. **GET /peminjaman/:id** - Detail peminjaman
**Response:**
```json
{
  "id": 1,
  "siswa_id": 10,
  "siswa_nama": "Budi Santoso 9",
  "siswa_kelas": "XI-A",
  "buku_id": 3,
  "buku_judul": "Perahu Kertas",
  "buku_penulis": "Dewi Lestari",
  "tanggal_pinjam": "2023-05-15",
  "tanggal_kembali": "2023-05-22",
  "status": "dikembalikan"
}
```

#### 3. **POST /peminjaman** - Tambah peminjaman
**Request Body:**
```json
{
  "siswa_id": 15,
  "buku_id": 2,
  "tanggal_pinjam": "2024-01-15",
  "status": "dipinjam"
}
```

**Response:**
```json
{
  "id": 31,
  "siswa_id": 15,
  "buku_id": 2,
  "tanggal_pinjam": "2024-01-15",
  "status": "dipinjam",
  "pesan": "Peminjaman berhasil dibuat"
}
```

#### 4. **PUT /peminjaman/:id/kembalikan** - Pengembalian buku
**Request Body (opsional):**
```json
{
  "tanggal_kembali": "2024-01-22"
}
```

**Response:**
```json
{
  "pesan": "Buku berhasil dikembalikan",
  "tanggal_kembali": "2024-01-22",
  "status": "dikembalikan",
  "keterlambatan_hari": 0
}
```

#### 5. **DELETE /peminjaman/:id** - Hapus peminjaman
**Response:**
```json
{
  "pesan": "Peminjaman dihapus"
}
```

#### 6. **GET /peminjaman/laporan/statistik** - Statistik peminjaman
**Response:**
```json
{
  "statistik": {
    "total_peminjaman": 30,
    "sedang_dipinjam": 8,
    "sudah_dikembalikan": 18,
    "terlambat": 4
  },
  "buku_terpopuler": [
    {
      "id": 1,
      "judul": "Laskar Pelangi",
      "jumlah_peminjaman": 12
    }
  ]
}
```

---

## Contoh Penggunaan dengan curl

### 1. Daftar semua siswa
```bash
curl -X GET "http://localhost:3000/api/siswa"
```

### 2. Tambah buku baru
```bash
curl -X POST "http://localhost:3000/api/buku" \
  -H "Content-Type: application/json" \
  -d '{
    "judul": "Sang Pemimpi",
    "penulis": "Andrea Hirata",
    "penerbit": "Bentang Pustaka",
    "tahun_terbit": 2006,
    "isbn": "9793062796",
    "stok": 5
  }'
```

### 3. Tambah peminjaman baru
```bash
curl -X POST "http://localhost:3000/api/peminjaman" \
  -H "Content-Type: application/json" \
  -d '{
    "siswa_id": 10,
    "buku_id": 1,
    "tanggal_pinjam": "2024-01-20",
    "status": "dipinjam"
  }'
```

### 4. Pengembalian buku
```bash
curl -X PUT "http://localhost:3000/api/peminjaman/5/kembalikan" \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal_kembali": "2024-01-27"
  }'
```

### 5. Lihat statistik
```bash
curl -X GET "http://localhost:3000/api/peminjaman/laporan/statistik"
```

---

## Fitur Tambahan

1. **Validasi Otomatis:**
   - Validasi input data
   - Validasi stok buku saat peminjaman
   - Validasi foreign key (siswa dan buku)

2. **Manajemen Stok:**
   - Stok berkurang otomatis saat peminjaman
   - Stok bertambah otomatis saat pengembalian
   - Pengecekan stok sebelum peminjaman

3. **Laporan:**
   - Statistik peminjaman
   - Buku terpopuler
   - Status peminjaman real-time

4. **Pencarian:**
   - Pencarian siswa berdasarkan nama
   - Pencarian buku berdasarkan judul, penulis, ISBN
   - Filter peminjaman berdasarkan status

---

## Skema Database

Diagram hubungan tabel:

```
siswa (1) ---- (n) peminjaman (n) ---- (1) buku
```

- Satu siswa dapat memiliki banyak peminjaman
- Satu buku dapat dipinjam oleh banyak siswa (dalam waktu berbeda)
- Setiap peminjaman mencatat siswa, buku, dan waktu pinjam/kembali

---

## Error Handling

Sistem memiliki error handling yang komprehensif:
- 400: Bad Request (data tidak valid)
- 404: Not Found (data tidak ditemukan)
- 409: Conflict (duplikasi data, contoh: ISBN sudah ada)
- 500: Internal Server Error (kesalahan server)

---

## Dependencies

- express: ^5.3.0
- mysql2: ^3.24.6
- newrelic: ^14.12.0

## Lisensi

MIT