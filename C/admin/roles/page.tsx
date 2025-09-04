"use client";
import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import RolesBoard from '@/components/admin/RolesBoard'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { RoleRow } from '@/lib/rbac.types'

export default function Page(){
  const [rows, setRows] = useState<RoleRow[]>([])
  const [q, setQ] = useState('')
  const [view, setView] = useState<'table'|'board'>('table')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/roles', { cache: 'no-store' })
    const data = await res.json()
    setRows(data?.items ?? [])
    setLoading(false)
  }

  useEffect(()=>{ load() },[])
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return rows
    return rows.filter(r =>
      r.name.toLowerCase().includes(t) ||
      (r.description ?? '').toLowerCase().includes(t) ||
      r.id.toLowerCase().includes(t)
    )
  }, [q, rows])

  async function createQuick() {
    const name = prompt('Role name? e.g. Auditor')
    if (!name) return
    await fetch('/api/roles', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name })})
    await load()
  }

  return (
    <div className='space-y-4'>
      <PageHeader title='Roles & Rights' subtitle='RBAC, permissions, feature flags' />
      <Card>
        <div className='flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-3'>
          <div className='flex gap-2 items-center'>
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder='Search roles...' className='min-w-[220px]' />
            <Button variant='secondary' onClick={()=>setView(view==='table'?'board':'table')}>
              {view==='table' ? 'Board View' : 'Table View'}
            </Button>
          </div>
          <div className='flex gap-2'>
            <Button variant='primary' onClick={createQuick}>New</Button>
            <Button variant='ghost' onClick={load}>Refresh</Button>
          </div>
        </div>

        {view==='board' ? (
          <RolesBoard items={filtered} />
        ) : (
          <div className='overflow-auto'>
            <table className='table w-full'>
              <thead>
                <tr className='text-left text-sm text-neutral-500'>
                  <th className='py-2 px-2'>ID</th>
                  <th className='py-2 px-2'>Name</th>
                  <th className='py-2 px-2'>Users</th>
                  <th className='py-2 px-2'>Updated</th>
                  <th className='py-2 px-2'></th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className='py-8 text-center text-neutral-500'>Loading…</td></tr>}
                {!loading && filtered.length===0 && <tr><td colSpan={5} className='py-8 text-center text-neutral-500'>No data yet</td></tr>}
                {filtered.map(r => (
                  <tr key={r.id} className='border-t border-neutral-100 dark:border-neutral-800'>
                    <td className='py-2 px-2 font-mono text-xs text-neutral-500'>{r.id}</td>
                    <td className='py-2 px-2'>
                      <div className='font-medium'>{r.name}</div>
                      <div className='text-xs text-neutral-500'>{r.description ?? '—'}</div>
                    </td>
                    <td className='py-2 px-2 text-neutral-600'>{r.usersCount ?? 0}</td>
                    <td className='py-2 px-2 text-neutral-500 text-xs'>{new Date(r.updatedAt).toLocaleString()}</td>
                    <td className='py-2 px-2 text-right'>
                      <Link href={/admin/roles/}>
                        <Button size='sm' variant='secondary'>Permissions</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}