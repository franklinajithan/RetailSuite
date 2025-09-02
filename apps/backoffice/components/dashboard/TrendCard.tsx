'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'
import Card from '@/components/ui/Card'

const data = Array.from({length: 12}).map((_,i)=>({
  m: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  sales: Math.round(800 + Math.random()*400),
  tickets: Math.round(200 + Math.random()*150),
}))

export default function TrendCard(){
  return (
    <Card>
      <div className='flex items-center justify-between mb-3'>
        <div className='font-medium'>Sales Trend</div>
        <div className='text-xs text-neutral-500'>Demo data</div>
      </div>
      <div className='h-56'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={data} margin={{left:0,right:0,top:10,bottom:0}}>
            <defs>
              <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#0ea5e9' stopOpacity={0.35}/>
                <stop offset='100%' stopColor='#0ea5e9' stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray='3 3'/>
            <XAxis dataKey='m' tickLine={false}/>
            <YAxis width={36} tickLine={false}/>
            <Tooltip />
            <Area type='monotone' dataKey='sales' stroke='#0ea5e9' fill='url(#g)' />
            <Line type='monotone' dataKey='tickets' stroke='#94a3b8' dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}