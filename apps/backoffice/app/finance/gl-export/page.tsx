'use client'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useState } from 'react'

export default function Page(){
  const [q, setQ] = useState('')
  return (
    <div className='space-y-4'>
      <PageHeader title='GL Export' subtitle='Finance & Tax' />
      <Card>
        <div className='flex gap-2 mb-3'>
          <Input placeholder='Search...' value={q} onChange={e=>setQ(e.target.value)} />
          <Button>New</Button>
        </div>
        <div className='overflow-auto'>
          <table className='table'>
            <thead><tr><th>ID</th><th>Name</th><th>Updated</th><th></th></tr></thead>
            <tbody>
              <tr><td colSpan={4} className='py-8 text-neutral-500 text-center'>TODO: connect GL Export to API</td></tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}