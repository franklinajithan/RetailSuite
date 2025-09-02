"use client"
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { groups } from "@/components/nav/catalog";
import { Search, X } from "lucide-react";

export default function CommandPalette(){
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac && e.metaKey && e.key.toLowerCase()==="k") || (!isMac && e.ctrlKey && e.key.toLowerCase()==="k")){
        e.preventDefault();
        setOpen(true);
        setQ("");
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(()=>{
    const t = q.trim().toLowerCase();
    if (!t) return groups;
    return groups.map(g=>({
      ...g,
      items: g.items.filter(i => `${i.label} ${i.href}`.toLowerCase().includes(t))
    })).filter(g=>g.items.length);
  },[q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={()=>setOpen(false)} />
      <div className="absolute inset-x-3 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-14 w-[min(900px,calc(100%-1.5rem))] max-h-[70vh] overflow-auto rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-2 p-3 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-inherit">
          <Search size={16} />
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search pages…"
            className="flex-1 outline-none bg-transparent" />
          <button className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={()=>setOpen(false)} aria-label="Close">
            <X size={16}/>
          </button>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {results.map(g=>(
            <div key={g.key}>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">{g.title}</div>
              <div className="space-y-1">
                {g.items.map(it=>(
                  <button key={it.href}
                    onClick={()=>{ setOpen(false); router.push(it.href) }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-neutral-800"
                  >
                    <div className="text-sm">{it.label}</div>
                    <div className="text-xs text-neutral-500">{it.href}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {results.length===0 && <div className="text-neutral-500 text-sm px-3 py-6">No matches.</div>}
        </div>
      </div>
    </div>
  )
}