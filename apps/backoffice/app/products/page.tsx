"use client";
import { useEffect, useState } from "react";
export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ retailerId: 1, sku: "", name: "", barcode: ""});
  useEffect(()=>{ fetch("/api/products").then(r=>r.json()).then(setRows); },[]);
  const add = async () => {
    const r = await fetch("/api/products", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(form) });
    if (r.ok) location.reload();
  };
  return (<div className="p-6 space-y-3">
    <h1 className="text-xl font-bold">Products</h1>
    <div className="flex gap-2 flex-wrap">
      <input className="border p-2" value={form.retailerId} onChange={e=>setForm({...form, retailerId: Number(e.target.value)})} placeholder="Retailer ID" />
      <input className="border p-2" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} placeholder="SKU" />
      <input className="border p-2" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Name" />
      <input className="border p-2" value={form.barcode} onChange={e=>setForm({...form, barcode: e.target.value})} placeholder="Barcode" />
      <button className="bg-black text-white px-3" onClick={add}>Add</button>
    </div>
    <table className="min-w-[800px] border"><thead><tr><th className="border p-2">ID</th><th className="border p-2">Retailer</th><th className="border p-2">SKU</th><th className="border p-2">Name</th><th className="border p-2">Barcode</th></tr></thead>
    <tbody>{rows.map(r=>(<tr key={r.id}><td className="border p-2">{r.id}</td><td className="border p-2">{r.retailerId}</td><td className="border p-2">{r.sku}</td><td className="border p-2">{r.name}</td><td className="border p-2">{r.barcode}</td></tr>))}</tbody></table>
  </div>);
}