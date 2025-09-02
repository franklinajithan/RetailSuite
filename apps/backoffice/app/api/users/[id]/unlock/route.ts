import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { userProfiles, authLogs } from "@/db/schema.usersec";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.insert(userProfiles).values({ userId: params.id, status: "active", failedLogins: 0 })
    .onConflictDoUpdate({ target: userProfiles.userId, set: { status: "active", failedLogins: 0, updatedAt: new Date() } });
  await db.insert(authLogs).values({ userId: params.id, event: "user.unlock", meta: { by: session.user.email } });
  return NextResponse.json({ ok: true });
}