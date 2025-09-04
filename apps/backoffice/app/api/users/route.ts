// app/api/users/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { userProfiles, roles, userRoles, authLogs } from "@/db/schema.usersec";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

/* -------------------------------------------------------------------------- */
/*                                   Schemas                                  */
/* -------------------------------------------------------------------------- */

const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  phone: z.string().optional(),
  avatarUrl: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url().optional()
  ),
  roles: z.array(z.string()).default([]),
  status: z.enum(["active", "suspended", "invited"]).default("active"),
});

/* -------------------------------------------------------------------------- */
/*                                 Utilities                                  */
/* -------------------------------------------------------------------------- */

function parseQuery(urlStr: string) {
  const url = new URL(urlStr);
  return {
    q: url.searchParams.get("q")?.trim() ?? "",
    status: url.searchParams.get("status") ?? "all",
    limit: Number(url.searchParams.get("limit") ?? 50),
    offset: Number(url.searchParams.get("offset") ?? 0),
  };
}

function toTitle(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function logError(ctx: string, e: unknown) {
  console.error(`${ctx}`, {
    message: (e as any)?.message,
    code: (e as any)?.code,
    detail: (e as any)?.detail,
    stack: (e as any)?.stack,
  });
}

/* -------------------------------------------------------------------------- */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { q, status, limit, offset } = parseQuery(req.url);

    const whereParts: unknown[] = [];
    if (q) whereParts.push(or(ilike(users.email, `%${q}%`), ilike(users.name, `%${q}%`)));
    const whereClauseUsersOnly = whereParts.length ? and(...(whereParts as any)) : undefined;

    // Attempt full join first; fallback to users-only if join fails due to type mismatch
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const safeOffset = Math.max(offset, 0);

    let items: Array<Record<string, unknown>> = [];
    let counts: Record<string, number> = {} as any;

    try {
      const wherePartsJoin: unknown[] = [...whereParts];
      if (status !== "all") wherePartsJoin.push(eq(userProfiles.status, status));
      const whereClauseJoin = wherePartsJoin.length ? and(...(wherePartsJoin as any)) : undefined;

      items = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          status: userProfiles.status,
          phone: userProfiles.phone,
          avatarUrl: userProfiles.avatarUrl,
          lastLoginAt: userProfiles.lastLoginAt,
          failedLogins: userProfiles.failedLogins,
          mfaEnabled: userProfiles.mfaEnabled,
          mustChangePassword: userProfiles.mustChangePassword,
        })
        .from(users)
        .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
        .where(whereClauseJoin)
        .orderBy(
          desc(sql`coalesce(${userProfiles.lastLoginAt}, '1970-01-01'::timestamptz)`)
        )
        .limit(safeLimit)
        .offset(safeOffset);

      const c = await db.execute(sql`
        select
          coalesce(sum(case when up.status = 'active' then 1 else 0 end), 0)::int    as active,
          coalesce(sum(case when up.status = 'suspended' then 1 else 0 end), 0)::int as suspended,
          coalesce(sum(case when up.status = 'invited' then 1 else 0 end), 0)::int   as invited,
          count(*)::int                                                               as total
        from ${users} u
        left join ${userProfiles} up on up.user_id = u.id
      `);
      counts = (c.rows?.[0] as any) ?? {};
    } catch (joinErr: unknown) {
      logError("GET /api/users join failed, falling back to users-only", joinErr);

      // Fallback: users only
      items = await db
        .select({ id: users.id, email: users.email, name: users.name, role: users.role })
        .from(users)
        .where(whereClauseUsersOnly)
        .orderBy(desc(users.id))
        .limit(safeLimit)
        .offset(safeOffset);

      // Basic counts without profile statuses
      const c = await db.execute(sql`select count(*)::int as total from ${users}`);
      counts = { total: (c.rows?.[0] as any)?.total ?? 0, active: 0, suspended: 0, invited: 0 } as any;
    }

    return NextResponse.json({ items, counts });
  } catch (e: unknown) {
    // Dev-friendly fallback when DB is not reachable
    if ((e as any)?.code === "ECONNREFUSED") {
      return NextResponse.json({ items: [], counts: { total: 0, active: 0, suspended: 0, invited: 0 } });
    }
    logError("GET /api/users error", e);
    return NextResponse.json({ error: (e as any)?.message || "Server error" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = CreateUser.parse(await req.json());

    // upfront duplicate check (friendly error)
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email));

    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    // all-or-nothing for user + profile + roles
    const newUserId = await db.transaction(async (tx) => {
      const [u] = await tx
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
          passwordHash,
          role: "retailer_admin",
        })
        .returning();

      await tx
        .insert(userProfiles)
        .values({
          userId: u.id as any,
          status: input.status,
          phone: input.phone ?? null,
          avatarUrl: input.avatarUrl ?? null,
        })
        .onConflictDoNothing();

      for (const key of input.roles) {
        const [r] = await tx
          .insert(roles)
          .values({ key, name: toTitle(key) })
          .onConflictDoUpdate({
            target: roles.key,
            set: { name: sql`${roles.name}` },
          })
          .returning();

        await tx
          .insert(userRoles)
          .values({ userId: u.id as any, roleId: r.id as any })
          .onConflictDoNothing();
      }

      return u.id;
    });

    try {
      await db.insert(authLogs).values({
        userId: newUserId as any,
        event: "user.created",
        meta: { by: session.user.email },
      });
    } catch (auditErr: unknown) {
      logError("Audit insert failed", auditErr);
    }

    return NextResponse.json({ ok: true, id: newUserId });
  } catch (e: unknown) {
    if ((e as any)?.issues) {
      return NextResponse.json({ error: (e as any).issues }, { status: 400 });
    }

    const msg = String((e as any)?.message || "");
    if (msg.includes("duplicate key") && msg.includes("users_email_unique")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    logError("POST /api/users error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
