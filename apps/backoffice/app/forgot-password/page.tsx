'use client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useState } from 'react'
export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/auth/forgot', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({email}) })
    alert('If the email exists, a reset link will be sent.')
  }
  return (
    <div className='min-h-[70vh] flex items-center justify-center'>
      <div className='card max-w-md w-full p-6'>
        <h1 className='text-xl font-semibold'>Reset password</h1>
        <p className='text-sm text-neutral-500 mb-4'>Enter your email to receive a reset link.</p>
        <form className='space-y-3' onSubmit={submit}>
          <Input placeholder='you@company.com' value={email} onChange={e=>setEmail(e.target.value)} />
          <Button className='w-full'>Send link</Button>
        </form>
      </div>
    </div>
  )
}