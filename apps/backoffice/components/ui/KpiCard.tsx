import React from 'react'
import clsx from 'clsx'

export default function KpiCard({
  title, value, hint, icon
}: { title: string; value: React.ReactNode; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className={clsx('card p-4 md:p-5')}>
      <div className='flex items-start gap-3'>
        {icon && <div className='rounded-xl p-2 bg-brand-50 text-brand-700 dark:bg-neutral-800 dark:text-brand-400'>{icon}</div>}
        <div className='flex-1'>
          <div className='text-sm text-neutral-500'>{title}</div>
          <div className='text-2xl font-semibold mt-1'>{value}</div>
          {hint && <div className='text-xs text-neutral-500 mt-1'>{hint}</div>}
        </div>
      </div>
    </div>
  )
}