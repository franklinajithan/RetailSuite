"use client";
import { useEffect, useState } from "react";
export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ retailerId: 1, storeId: 1, productId: 1, price: 0.99});
  useEffect(()=>{ fetch("/api/store-prices").then(r=>r.json()).then(setRows); },[]);
  const add = async () => {
    const r = await fetch("/api/store-prices", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(form) });
    if (r.ok) location.reload();
  };
  return (<div className="p-6 space-y-3">
    <h1 className="text-xl font-bold">Store Prices</h1>
    <div className="flex gap-2 flex-wrap">
      <input className="border p-2" value={form.retailerId} onChange={e=>setForm({...form, retailerId: Number(e.target.value)})} placeholder="Retailer ID" />
      <input className="border p-2" value={form.storeId} onChange={e=>setForm({...form, storeId: Number(e.target.value)})} placeholder="Store ID" />
      <input className="border p-2" value={form.productId} onChange={e=>setForm({...form, productId: Number(e.target.value)})} placeholder="Product ID" />
      <input className="border p-2" value={form.price} onChange={e=>setForm({...form, price: Number(e.target.value)})} placeholder="Price" />
      <button className="bg-black text-white px-3" onClick={add}>Add</button>
    </div>
    <table className="min-w-[800px] border"><thead><tr><th className="border p-2">ID</th><th className="border p-2">Retailer</th><th className="border p-2">Store</th><th className="border p-2">Product</th><th className="border p-2">Price</th></tr></thead>
    <tbody>{rows.map(r=>(<tr key={r.id}><td className="border p-2">{r.id}</td><td className="border p-2">{r.retailerId}</td><td className="border p-2">{r.storeId}</td><td className="border p-2">{r.productId}</td><td className="border p-2">{r.price}</td></tr>))}</tbody></table>
  </div>);
}