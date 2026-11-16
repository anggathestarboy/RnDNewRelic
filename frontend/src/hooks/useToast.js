import { useCallback, useEffect, useState } from 'react'

export default function useToast(durasi = 3500) {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), durasi)
    return () => clearTimeout(timer)
  }, [toast, durasi])

  const tampilkan = useCallback((text, tipe = 'ok') => {
    setToast({ text, tipe, id: Date.now() })
  }, [])

  const tutup = useCallback(() => setToast(null), [])

  return { toast, tampilkan, tutup }
}
