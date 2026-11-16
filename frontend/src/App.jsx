import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/dashboard'
import { Buku } from './pages/Buku'
import { Siswa } from './pages/Siswa'
import { Peminjaman } from './pages/Peminjaman'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buku" element={<Buku />} />
          <Route path="/siswa" element={<Siswa />} />
          <Route path="/peminjaman" element={<Peminjaman />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
