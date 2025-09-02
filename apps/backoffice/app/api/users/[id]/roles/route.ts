import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { roles, userRoles, authLogs } from "@/db/schema.usersec";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(()=>({roles:[]}));
  const keys: string[] = Array.isArray(body.roles) ? body.roles : [];

  await db.delete(userRoles).where(eq(userRoles.userId, params.id));
  for (const key of keys) {
    const [r] = await db.insert(roles)
      .values({ key, name: key.replace(/_/g," ").replace(/\b\w/g,s=>s.toUpperCase()) })
      .onConflictDoUpdate({ target: roles.key, set: { key: roles.key } })
      .returning();
    await db.insert(userRoles).values({ userId: params.id, roleId: r.id }).onConflictDoNothing();
  }
  await db.insert(authLogs).values({ userId: params.id, event: "roles.set", meta: { by: session.user.email, roles: keys } });
  return NextResponse.json({ ok: true });
}