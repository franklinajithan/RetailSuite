import { db } from "@/db/client";
import { retailers } from "@/db/schema";
import { audit } from "@/lib/audit";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id:string }}) {
  const id = Number(params.id);
  const body = await req.json();
  const [row] = await db.update(retailers).set({ name: body.name }).where(eq(retailers.id, id)).returning();
  await audit({ entity: "retailers", entityId: id, action: "update", data: row });
  return Response.json(row);
}
export async function DELETE(_: NextRequest, { params }: { params: { id:string }}) {
  const id = Number(params.id);
  const [row] = await db.delete(retailers).where(eq(retailers.id, id)).returning();
  await audit({ entity: "retailers", entityId: id, action: "delete", data: row });
  return Response.json({ ok: true });
}