import { db } from "@/db/client";
import { retailers } from "@/db/schema";
import { audit } from "@/lib/audit";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(retailers);
  return Response.json(rows);
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(retailers).values({ name: body.name }).returning();
  await audit({ entity: "retailers", entityId: row.id, action: "create", data: row });
  return Response.json(row);
}