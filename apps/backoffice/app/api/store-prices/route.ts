import { db } from "@/db/client";
import { storePrices } from "@/db/schema";
import { audit } from "@/lib/audit";
import { NextRequest } from "next/server";

export async function GET() { return Response.json(await db.select().from(storePrices)); }
export async function POST(req: NextRequest) {
  const b = await req.json();
  const [row] = await db.insert(storePrices).values({ retailerId: b.retailerId, storeId: b.storeId, productId: b.productId, price: b.price }).returning();
  await audit({ entity: "store_prices", entityId: row.id, action: "create", data: row });
  return Response.json(row);
}