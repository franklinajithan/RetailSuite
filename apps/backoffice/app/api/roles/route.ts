import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { roles } from "@/db/schema.usersec";
import { ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

function parseQuery(urlStr: string) {
	const url = new URL(urlStr);
	return {
		q: url.searchParams.get("q")?.trim() ?? "",
		limit: Number(url.searchParams.get("limit") ?? 50),
		offset: Number(url.searchParams.get("offset") ?? 0),
	};
}

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { q, limit, offset } = parseQuery(req.url);
		const where = q
			? or(ilike(roles.key, `%${q}%`), ilike(roles.name, `%${q}%`))
			: undefined as any;
		const safeLimit = Math.min(Math.max(limit, 1), 200);
		const safeOffset = Math.max(offset, 0);

		const items = await db.select().from(roles).where(where).limit(safeLimit).offset(safeOffset);
		const countRes = await db.execute(sql`select count(*)::int as total from ${roles}`);
		return NextResponse.json({ items, total: countRes.rows?.[0]?.total ?? 0 });
	} catch (e:any) {
		console.error("GET /api/roles error:", e);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}

const CreateRole = z.object({ key: z.string().min(2).max(64), name: z.string().min(2).max(120).optional() });

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body = await req.json().catch(()=>({}));
		const input = CreateRole.parse(body);
		const name = input.name ?? input.key.replace(/_/g, " ").replace(/\b\w/g, s=>s.toUpperCase());
		const [r] = await db.insert(roles)
			.values({ key: input.key, name })
			.onConflictDoUpdate({ target: roles.key, set: { name: sql`${roles.name}` } })
			.returning();
		return NextResponse.json({ ok: true, role: r });
	} catch (e:any) {
		if (e?.issues) return NextResponse.json({ error: e.issues }, { status: 400 });
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
} 