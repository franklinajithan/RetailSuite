import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { userPrefs } from "@/db/schema.prefs";
import { eq } from "drizzle-orm";
import { z } from "zod";

const Prefs = z.object({
  favorites: z.array(z.string()).default([]),
  emoji: z.record(z.string()).default({}),
  mode: z.enum(["compact", "expanded"]).default("compact"),
});

async function getUserIdByEmail(email: string) {
  const row = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return row?.[0]?.id ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getUserIdByEmail(email);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const r = await db.select().from(userPrefs).where(eq(userPrefs.userId, userId));
  if (!r.length) {
    // default empty; UI adds visual defaults
    return NextResponse.json({ favorites: [], emoji: {}, mode: "compact" });
  }
  const row = r[0];
  return NextResponse.json({
    favorites: row.favorites ?? [],
    emoji: (row as any).emojiMap ?? {},
    mode: (row as any).sidebarMode ?? "compact",
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getUserIdByEmail(email);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const p = Prefs.parse(body);

  await db
    .insert(userPrefs)
    .values({
      userId,
      favorites: p.favorites,
      emojiMap: p.emoji as any,
      sidebarMode: p.mode,
    })
    .onConflictDoUpdate({
      target: userPrefs.userId,
      set: {
        favorites: p.favorites,
        emojiMap: p.emoji as any,
        sidebarMode: p.mode,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}