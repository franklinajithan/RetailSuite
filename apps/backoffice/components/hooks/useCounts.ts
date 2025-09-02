'use client'
import { useEffect, useState } from 'react'

export type Counts = { retailers: number; stores: number; products: number }

export default function useCounts() {
  const [counts, setCounts] = useState<Counts>({ retailers: 0, stores: 0, products: 0 })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function run() {
      try {
        const [r, s, p] = await Promise.all([
          fetch('/api/retailers').then(x => x.json()).catch(()=>[]),
          fetch('/api/stores').then(x => x.json()).catch(()=>[]),
          fetch('/api/products').then(x => x.json()).catch(()=>[]),
        ])
        setCounts({ retailers: r.length ?? 0, stores: s.length ?? 0, products: p.length ?? 0 })
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])
  return { counts, loading }
}