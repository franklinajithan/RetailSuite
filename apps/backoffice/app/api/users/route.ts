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

function logError(ctx: string, e: any) {
  console.error(`${ctx}`, {
    message: e?.message,
    code: e?.code,
    detail: e?.detail,
    stack: e?.stack,
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

    const whereParts: any[] = [];
    if (q) whereParts.push(or(ilike(users.email, `%${q}%`), ilike(users.name, `%${q}%`)));
    if (status !== "all") whereParts.push(eq(userProfiles.status, status));
    const whereClause = whereParts.length ? and(...whereParts) : undefined;

    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const safeOffset = Math.max(offset, 0);

    const items = await db
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
      .where(whereClause)
      .orderBy(
        // sort by last login, push nulls to the very end using a dummy epoch
        desc(sql`coalesce(${userProfiles.lastLoginAt}, '1970-01-01'::timestamptz)`)
      )
      .limit(safeLimit)
      .offset(safeOffset);

    const counts = await db.execute(sql`
      select
        coalesce(sum(case when up.status = 'active' then 1 else 0 end), 0)::int    as active,
        coalesce(sum(case when up.status = 'suspended' then 1 else 0 end), 0)::int as suspended,
        coalesce(sum(case when up.status = 'invited' then 1 else 0 end), 0)::int   as invited,
        count(*)::int                                                               as total
      from ${users} u
      left join ${userProfiles} up on up.user_id = u.id
    `);

    return NextResponse.json({ items, counts: counts.rows?.[0] ?? {} });
  } catch (e: any) {
    logError("GET /api/users error", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
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
          userId: u.id,
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
            target: roles.key, // ensure roles.key has a UNIQUE constraint
            set: { name: sql`${roles.name}` }, // no-op update keeps existing
          })
          .returning();

        await tx
          .insert(userRoles)
          .values({ userId: u.id, roleId: r.id })
          .onConflictDoNothing(); // requires unique (user_id, role_id)
      }

      return u.id;
    });

    // best-effort audit (don’t fail the request if logging fails)
    try {
      await db.insert(authLogs).values({
        userId: newUserId,
        event: "user.created", // ensure enum/table allows this value
        meta: { by: session.user.email },
      });
    } catch (auditErr: any) {
      logError("Audit insert failed", auditErr);
    }

    return NextResponse.json({ ok: true, id: newUserId });
  } catch (e: any) {
    if (e?.issues) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }

    const msg = String(e?.message || "");
    if (msg.includes("duplicate key") && msg.includes("users_email_unique")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    logError("POST /api/users error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
