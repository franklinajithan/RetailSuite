import { db } from "@/db/client";
import { products } from "@/db/schema";
import { audit } from "@/lib/audit";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id:string }}) {
  const id = Number(params.id); const b = await req.json();
  const [row] = await db.update(products).set({ sku: b.sku, name: b.name, barcode: b.barcode }).where(eq(products.id, id)).returning();
  await audit({ entity: "products", entityId: id, action: "update", data: row });
  return Response.json(row);
}
export async function DELETE(_: NextRequest, { params }: { params: { id:string }}) {
  const id = Number(params.id);
  const [row] = await db.delete(products).where(eq(products.id, id)).returning();
  await audit({ entity: "products", entityId: id, action: "delete", data: row });
  return Response.json({ ok: true });
}