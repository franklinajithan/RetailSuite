"use client";
import { useEffect, useState } from "react";
export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState("");
  useEffect(()=>{ fetch("/api/retailers").then(r=>r.json()).then(setRows); },[]);
  const add = async () => {
    const r = await fetch("/api/retailers", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({ name }) });
    if (r.ok) location.reload();
  };
  return (<div className="p-6 space-y-3">
    <h1 className="text-xl font-bold">Retailers</h1>
    <div className="flex gap-2"><input className="border p-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Retailer name" /><button className="bg-black text-white px-3" onClick={add}>Add</button></div>
    <table className="min-w-[600px] border"><thead><tr><th className="border p-2">ID</th><th className="border p-2">Name</th></tr></thead>
    <tbody>{rows.map(r=>(<tr key={r.id}><td className="border p-2">{r.id}</td><td className="border p-2">{r.name}</td></tr>))}</tbody></table>
  </div>);
}