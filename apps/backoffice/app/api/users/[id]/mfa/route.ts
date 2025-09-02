import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { userProfiles, authLogs } from "@/db/schema.usersec";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enabled } = await req.json().catch(()=>({enabled:false}));
  await db.insert(userProfiles).values({ userId: params.id, mfaEnabled: !!enabled })
    .onConflictDoUpdate({ target: userProfiles.userId, set: { mfaEnabled: !!enabled, updatedAt: new Date() } });
  await db.insert(authLogs).values({ userId: params.id, event: "mfa.toggle", meta: { by: session.user.email, enabled: !!enabled } });
  return NextResponse.json({ ok: true });
}