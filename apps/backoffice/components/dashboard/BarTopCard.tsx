'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '@/components/ui/Card'

const data = [
  { name: 'Beverages', qty: 320 },
  { name: 'Snacks', qty: 270 },
  { name: 'Dairy', qty: 190 },
  { name: 'Produce', qty: 160 },
  { name: 'Bakery', qty: 130 },
]

export default function BarTopCard(){
  return (
    <Card>
      <div className='flex items-center justify-between mb-3'>
        <div className='font-medium'>Top Categories (qty)</div>
        <div className='text-xs text-neutral-500'>Demo data</div>
      </div>
      <div className='h-56'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray='3 3'/>
            <XAxis dataKey='name' tickLine={false}/>
            <YAxis width={36} tickLine={false}/>
            <Tooltip />
            <Bar dataKey='qty' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}