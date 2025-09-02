'use client'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useEffect, useState } from 'react'

export default function Page(){
  const [rows, setRows] = useState<any[]>([])
  useEffect(()=>{ /* TODO: fetch data */ },[])
  return (
    <div className='space-y-4'>
      <PageHeader title='Suppliers' subtitle='Manage suppliers (MVP now, ASN later)' />
      <Card>
        <div className='flex gap-2 mb-3'>
          <Input placeholder='Search...' />
          <Button>New</Button>
        </div>
        <div className='overflow-auto'>
          <table className='table'>
            <thead><tr><th>ID</th><th>Name</th><th>Updated</th><th></th></tr></thead>
            <tbody>
              {rows.length===0 && <tr><td colSpan={4} className='text-neutral-500 py-8 text-center'>No data yet</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}