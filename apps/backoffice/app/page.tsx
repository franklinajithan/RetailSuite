'use client'
import { useEffect, useState } from 'react'
import { Package, Building2, Store, ChevronRight, Rocket } from 'lucide-react'
import KpiCard from '@/components/ui/KpiCard'
import Card from '@/components/ui/Card'
import TrendCard from '@/components/dashboard/TrendCard'
import BarTopCard from '@/components/dashboard/BarTopCard'
import useCounts from '@/components/hooks/useCounts'
import Link from 'next/link'

type Product = { id:number; sku:string; name:string; barcode?:string; updatedAt?:string }

export default function Page(){
  const { counts } = useCounts()
  const [recent, setRecent] = useState<Product[]>([])

  useEffect(()=>{
    fetch('/api/products').then(r=>r.json()).then((rows:Product[])=>{
      const latest = rows.slice(-6).reverse()
      setRecent(latest)
    }).catch(()=>setRecent([]))
  },[])

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='text-2xl font-semibold'>Dashboard</div>
        <span className='text-sm text-neutral-500'>Welcome back 👋</span>
      </div>

      {/* KPIs */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <KpiCard title='Retailers' value={counts.retailers} hint='Organizations onboarded' icon={<Building2 size={18}/>}/>
        <KpiCard title='Stores' value={counts.stores} hint='Active branches' icon={<Store size={18}/>}/>
        <KpiCard title='Products' value={counts.products} hint='Catalog size' icon={<Package size={18}/>}/>
        <KpiCard title='Status' value={<span className='text-green-600'>Healthy</span>} hint='All systems operational' icon={<Rocket size={18}/>}/>
      </div>

      {/* Charts */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='lg:col-span-2'><TrendCard/></div>
        <div className='lg:col-span-1'><BarTopCard/></div>
      </div>

      {/* Quick actions */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Action href='/master/items' label='Manage Items' />
        <Action href='/master/stores' label='Manage Stores' />
        <Action href='/admin/users' label='User & Roles' />
        <Action href='/master/promotion' label='Promotions' />
      </div>

      {/* Recent activity */}
      <Card>
        <div className='flex items-center justify-between mb-3'>
          <div className='font-medium'>Recently Added / Updated Products</div>
          <Link href='/master/items' className='text-sm text-brand-700 hover:underline inline-flex items-center'>View all <ChevronRight size={16}/></Link>
        </div>
        <div className='overflow-auto'>
          <table className='table'>
            <thead><tr><th style={{width:60}}>ID</th><th>SKU</th><th>Name</th><th>Barcode</th></tr></thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={4} className='py-8 text-neutral-500 text-center'>No recent changes</td></tr>
              ) : (
                recent.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>{p.barcode || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Action({href,label}:{href:string,label:string}){
  return (
    <Link href={href} className='card p-4 hover:shadow-lg transition-shadow'>
      <div className='text-sm text-neutral-500'>{label}</div>
      <div className='mt-1 inline-flex items-center gap-1 text-brand-700'>Open <ChevronRight size={16}/></div>
    </Link>
  )
}