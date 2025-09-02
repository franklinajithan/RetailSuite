import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let dbOk = false;
    try {
      await db.execute(sql`select 1`);
      dbOk = true;
    } catch (e) {
      dbOk = false;
    }
    return Response.json({
      ok: true,
      db: dbOk,
      session: !!session,
      user: session?.user?.email ?? null
    });
  } catch (e:any) {
    return Response.json({ ok:false, error: e?.message || "unknown" }, { status: 500 });
  }
}