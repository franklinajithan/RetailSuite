import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { userProfiles, roles, userRoles, authLogs } from "@/db/schema.usersec";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    const [row] = await db
      .select({
        id: users.id, email: users.email, name: users.name, role: users.role,
        status: userProfiles.status, phone: userProfiles.phone, avatarUrl: userProfiles.avatarUrl,
        lastLoginAt: userProfiles.lastLoginAt, failedLogins: userProfiles.failedLogins,
        mfaEnabled: userProfiles.mfaEnabled, mustChangePassword: userProfiles.mustChangePassword,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.id, id));
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rs = await db.select({ roleId: userRoles.roleId, key: roles.key })
      .from(userRoles).leftJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, id));
    return NextResponse.json({ ...row, roles: rs.map(r => r.key) });
  } catch (e:any) {
    console.error("GET /api/users/[id] error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

const PutUser = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active","suspended","invited"]).default("active"),
  roles: z.array(z.string()).default([]),
  mfaEnabled: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    const input = PutUser.parse(await req.json());

    await db.update(users).set({ name: input.name }).where(eq(users.id, id));
    await db.insert(userProfiles).values({
      userId: id, phone: input.phone, avatarUrl: input.avatarUrl || null,
      status: input.status, mfaEnabled: input.mfaEnabled ?? false
    }).onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        phone: input.phone, avatarUrl: input.avatarUrl || null,
        status: input.status, mfaEnabled: input.mfaEnabled ?? false, updatedAt: new Date()
      }
    });

    await db.delete(userRoles).where(eq(userRoles.userId, id));
    for (const key of input.roles) {
      const [r] = await db.insert(roles)
        .values({ key, name: key.replace(/_/g, " ").replace(/\b\w/g, s=>s.toUpperCase()) })
        .onConflictDoUpdate({ target: roles.key, set: { key: roles.key } })
        .returning();
      await db.insert(userRoles).values({ userId: id, roleId: r.id }).onConflictDoNothing();
    }

    await db.insert(authLogs).values({ userId: id, event: "user.updated", meta: { by: session.user.email } });
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    console.error("PUT /api/users/[id] error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    await db.insert(userProfiles).values({ userId: id, status: "suspended" })
      .onConflictDoUpdate({ target: userProfiles.userId, set: { status: "suspended", updatedAt: new Date() } });
    await db.insert(authLogs).values({ userId: id, event: "user.suspended", meta: { by: session.user.email } });
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    console.error("DELETE /api/users/[id] error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}