'use client'
import { Sun, Moon, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const d = localStorage.getItem('theme') === 'dark'
    setDark(d)
    document.documentElement.classList.toggle('dark', d)
  },[])
  const toggle = () => {
    const next = !dark; setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur">
      <div className="h-14 flex items-center px-4 gap-3">
        <button className="md:hidden btn" onClick={onMenu} title="Menu"><Menu size={20}/></button>
        <div className="font-semibold">Retail Backoffice</div>
        <div className="ml-auto flex items-center gap-2">
          <button className="btn" onClick={toggle} title="Theme">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>
      </div>
    </header>
  )
}