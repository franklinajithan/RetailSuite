import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { invitations, authLogs } from "@/db/schema.usersec";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, roleKeys = [] } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const token = crypto.randomBytes(24).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const self = await db.select({ id: users.id }).from(users).where(eq(users.email, session.user.email));
  await db.insert(invitations).values({ email, invitedBy: self[0]?.id, tokenHash, roleKeys });

  await db.insert(authLogs).values({ event: "invite.sent", meta: { by: session.user.email, email } });
  return NextResponse.json({ ok: true, inviteToken: token });
}