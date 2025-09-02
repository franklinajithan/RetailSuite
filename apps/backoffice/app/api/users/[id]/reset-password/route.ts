import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { userProfiles, authLogs } from "@/db/schema.usersec";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const temp = Math.random().toString(36).slice(2, 10) + "!A9";
  const hash = await bcrypt.hash(temp, 10);
  await db.update(users).set({ passwordHash: hash }).where(eq(users.id, params.id));
  await db.insert(userProfiles).values({ userId: params.id, mustChangePassword: true })
    .onConflictDoUpdate({ target: userProfiles.userId, set: { mustChangePassword: true } });
  await db.insert(authLogs).values({ userId: params.id, event: "password.reset", meta: { by: session.user.email } });
  return NextResponse.json({ ok: true, temporaryPassword: temp });
}