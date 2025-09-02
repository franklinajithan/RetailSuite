import { db } from "@/db/client";
import { products } from "@/db/schema";
import { audit } from "@/lib/audit";
import { NextRequest } from "next/server";

export async function GET() { return Response.json(await db.select().from(products)); }
export async function POST(req: NextRequest) {
  const b = await req.json();
  const [row] = await db.insert(products).values({ retailerId: b.retailerId, sku: b.sku, name: b.name, barcode: b.barcode }).returning();
  await audit({ entity: "products", entityId: row.id, action: "create", data: row });
  return Response.json(row);
}