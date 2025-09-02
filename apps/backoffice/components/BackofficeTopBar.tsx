import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, CircleHelp, Clock3, Command, Download, Home, LogOut, Menu, Moon, Plus, RefreshCcw, Search, Settings, Sun, User, Users, Palette, ShieldCheck, Box, Building2, KeyRound, Laptop, Mail } from "lucide-react";

const BRAND = { name: "Retail Backoffice", logo: (<div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-sm grid place-items-center text-white font-bold">R</div>) };

function useTheme() {
  const [theme, setTheme] = useState<string>(() => typeof window === "undefined" ? "system" : localStorage.getItem("rb_theme") || "system");
  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (theme === "system" && systemDark);
    root.classList.toggle("dark", isDark);
    localStorage.setItem("rb_theme", theme);
  }, [theme]);
  return { theme, setTheme } as const;
}

function CommandPalette({ open, setOpen, actions }:{
  open:boolean; setOpen:(v:boolean)=>void;
  actions:Array<{ id:string; icon:React.ReactNode; label:string; kbd?:string; run:()=>void }>
}) {
  const [q, setQ] = useState(""); const inputRef = useRef<HTMLInputElement>(null);
  useEffect(()=>{ if(open){ setQ(""); inputRef.current?.focus(); } },[open]);
  const filtered = useMemo(()=>{ const x=q.trim().toLowerCase(); return x?actions.filter(a=>a.label.toLowerCase().includes(x)):actions;},[q,actions]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] bg-black/40" onClick={()=>setOpen(false)}>
          <motion.div initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="mx-auto mt-24 w-full max-w-xl rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
            onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
              <Search className="h-4 w-4 text-zinc-500"/>
              <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search actions, pages, settings…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500"/>
              <span className="hidden md:inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] text-zinc-500 dark:border-zinc-700"><Command className="h-3 w-3"/>K</span>
            </div>
            <div className="mt-2 max-h-80 overflow-auto">
              {filtered.length===0? <div className="p-4 text-sm text-zinc-500">No matches.</div> : (
                <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
                  {filtered.map(a=>(
                    <li key={a.id}><button onClick={()=>{a.run(); setOpen(false);}}
                      className="group flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/70">
                      <span className="opacity-70 group-hover:opacity-100">{a.icon}</span>
                      <span className="flex-1">{a.label}</span>
                      {a.kbd && <span className="rounded-md border px-1.5 py-0.5 text-[10px] text-zinc-500 dark:border-zinc-700">{a.kbd}</span>}
                    </button></li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const StatusPill = ({label="EU-West · Synced", tone="success" as "success"|"warning"|"danger"|"info"}) => {
  const tones:Record<string,string>={
    success:"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    warning:"bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    danger:"bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    info:"bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}><span className="h-1.5 w-1.5 rounded-full bg-current"></span>{label}</span>;
};

const Avatar=({name="Ajithan",size=28}:{name?:string;size?:number})=>{
  const init=name.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();
  return <div className="grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow" style={{width:size,height:size,fontSize:size*0.4}}>{init}</div>;
};

export default function BackofficeTopBar({ onNewUser, onImportCSV, onOpenSettings }:{
  onNewUser?:()=>void; onImportCSV?:()=>void; onOpenSettings?:()=>void;
}){
  const {theme,setTheme}=useTheme();
  const [cmdOpen,setCmdOpen]=useState(false);
  const [notifOpen,setNotifOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [helpOpen,setHelpOpen]=useState(false);
  const [busy,setBusy]=useState(false);

  useEffect(()=>{ const onKey=(e:KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){ e.preventDefault(); setCmdOpen(v=>!v);} }; window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey);},[]);

  const actions=[
    { id:"newUser", icon:<Users className="h-4 w-4"/>, label:"Create: New user", kbd:"N U", run:()=>onNewUser?.() },
    { id:"importCsv", icon:<Download className="h-4 w-4"/>, label:"Import users from CSV", kbd:"I C", run:()=>onImportCSV?.() },
    { id:"settings", icon:<Settings className="h-4 w-4"/>, label:"Open Settings", kbd:",", run:()=>onOpenSettings?.() },
    { id:"docs", icon:<CircleHelp className="h-4 w-4"/>, label:"Open Documentation", run:()=>alert("Open docs…") },
    { id:"home", icon:<Home className="h-4 w-4"/>, label:"Go to Dashboard", run:()=>alert("Navigate: Dashboard") },
  ];

  const refresh=async()=>{setBusy(true); await new Promise(r=>setTimeout(r,900)); setBusy(false);};

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          {BRAND.logo}
          <div className="hidden sm:block">
            <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{BRAND.name}</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-zinc-900 dark:text-zinc-100">Dashboard</span>
            </div>
          </div>
          <div className="sm:hidden"><Menu className="h-5 w-5"/></div>
        </div>

        <div className="hidden md:flex flex-1 items-center">
          <div className="relative mx-auto w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500"/>
            <input className="w-full rounded-xl border border-zinc-200 bg-white px-9 py-2 text-sm shadow-sm outline-none placeholder:text-zinc-500 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-sky-600 dark:focus:ring-sky-900/40" placeholder="Search… (⌘K)" onFocus={()=>setCmdOpen(true)} readOnly />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="hidden xl:block"><StatusPill/></div>

          <div className="relative">
            <button onClick={()=>{document.getElementById("rb-quick-create")?.classList.toggle("hidden");}}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-2.5 py-2 text-sm font-medium hover:bg-zinc-50 active:scale-[.99] dark:border-zinc-800 dark:hover:bg-zinc-800/70" title="Quick create">
              <Plus className="h-4 w-4"/><span className="hidden lg:inline">New</span><ChevronDown className="h-3.5 w-3.5 opacity-60"/>
            </button>
            <div id="rb-quick-create" className="hidden absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <button onClick={()=>onNewUser?.()} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"><User className="h-4 w-4"/> New user</button>
              <button onClick={()=>alert('New role…')} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"><ShieldCheck className="h-4 w-4"/> New role</button>
              <button onClick={()=>alert('New store…')} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"><Building2 className="h-4 w-4"/> New store</button>
              <button onClick={()=>onImportCSV?.()} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"><Download className="h-4 w-4"/> Import CSV</button>
            </div>
          </div>

          <button onClick={refresh} className="rounded-xl p-2 hover:bg-zinc-50 active:scale-[.98] dark:hover:bg-zinc-800/70" title="Refresh"><RefreshCcw className={`h-5 w-5 ${busy?"animate-spin":""}`}/></button>

          <div className="relative">
            <button onClick={()=>setNotifOpen(v=>!v)} className="relative rounded-xl p-2 hover:bg-zinc-50 active:scale-[.98] dark:hover:bg-zinc-800/70" title="Notifications">
              <Bell className="h-5 w-5"/><span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-semibold text-white grid place-items-center shadow">3</span>
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
                  className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="px-3 py-2 text-xs font-medium text-zinc-500">Notifications</div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {[{icon:<Users className='h-4 w-4'/>,title:'2 new users pending approval',time:'2m'},
                      {icon:<Box className='h-4 w-4'/>,title:'Inventory sync completed',time:'18m'},
                      {icon:<KeyRound className='h-4 w-4'/>,title:'New permission template added',time:'1h'},].map((n,i)=>(
                        <div key={i} className="flex items-start gap-3 px-3 py-3 text-sm">
                          <div className="mt-0.5 text-zinc-500">{n.icon}</div>
                          <div className="flex-1"><div className="leading-tight">{n.title}</div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><Clock3 className="h-3.5 w-3.5"/> {n.time}</div>
                          </div>
                        </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={()=>setHelpOpen(v=>!v)} className="rounded-xl p-2 hover:bg-zinc-50 active:scale-[.98] dark:hover:bg-zinc-800/70" title="Help & resources"><CircleHelp className="h-5 w-5"/></button>
            <AnimatePresence>
              {helpOpen && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="p-2 text-sm">
                    <a className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800" href="#" onClick={(e)=>e.preventDefault()}><Mail className="h-4 w-4"/> Contact support</a>
                    <a className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800" href="#" onClick={(e)=>e.preventDefault()}><Laptop className="h-4 w-4"/> Keyboard shortcuts</a>
                    <a className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800" href="#" onClick={(e)=>e.preventDefault()}><CircleHelp className="h-4 w-4"/> Docs & Guides</a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={()=>{document.getElementById("rb-theme-menu")?.classList.toggle("hidden");}}
              className="rounded-xl p-2 hover:bg-zinc-50 active:scale-[.98] dark:hover:bg-zinc-800/70" title="Theme">
              {theme==="dark"?<Moon className="h-5 w-5"/>:theme==="light"?<Sun className="h-5 w-5"/>:<Palette className="h-5 w-5"/>}
            </button>
            <div id="rb-theme-menu" className="hidden absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              {[{key:"light",icon:<Sun className="h-4 w-4"/>,label:"Light"},{key:"dark",icon:<Moon className="h-4 w-4"/>,label:"Dark"},{key:"system",icon:<Laptop className="h-4 w-4"/>,label:"System"}].map(m=>(
                <button key={m.key} onClick={()=>{setTheme(m.key); document.getElementById("rb-theme-menu")?.classList.add("hidden");}}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 ${theme===m.key?"text-sky-600 dark:text-sky-400":""}`}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <button onClick={()=>setProfileOpen(v=>!v)} className="flex items-center gap-2 rounded-xl border border-transparent px-1.5 py-1 hover:border-zinc-200 dark:hover:border-zinc-800" title="Account">
              <Avatar/><span className="hidden lg:block text-sm font-medium">Ajithan</span><ChevronDown className="hidden lg:block h-3.5 w-3.5 opacity-60"/>
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="px-3 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Avatar size={36}/>
                      <div>
                        <div className="font-semibold leading-tight">Ajithan Franklin</div>
                        <div className="text-xs text-zinc-500">ajithan@example.com</div>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
                    <div className="py-1">
                      <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"><User className="h-4 w-4"/> Profile</button>
                      <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"><Settings className="h-4 w-4"/> Settings</button>
                      <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"><ShieldCheck className="h-4 w-4"/> Org & Roles</button>
                    </div>
                    <div>
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><LogOut className="h-4 w-4"/> Sign out</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} actions={actions}/>
    </header>
  );
}