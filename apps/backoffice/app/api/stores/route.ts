import { db } from "@/db/client";
import { stores } from "@/db/schema";
import { audit } from "@/lib/audit";
import { NextRequest } from "next/server";

export async function GET() { return Response.json(await db.select().from(stores)); }
export async function POST(req: NextRequest) {
  const b = await req.json();
  const [row] = await db.insert(stores).values({ retailerId: b.retailerId, name: b.name, code: b.code }).returning();
  await audit({ entity: "stores", entityId: row.id, action: "create", data: row });
  return Response.json(row);
}