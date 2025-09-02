// app/api/me/prefs/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { userPrefs } from "@/db/schema.prefs";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

const Prefs = z.object({
  favorites: z.array(z.string()).default([]),
  emoji: z.record(z.string()).default({}),
  mode: z.enum(["compact", "expanded"]).default("compact"),
});

type PrefsDTO = z.infer<typeof Prefs>;

const DEFAULT_PREFS: PrefsDTO = {
  favorites: [],
  emoji: {},
  mode: "compact",
};

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) throw new Response("Unauthorized", { status: 401 });

  const row = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  const userId = row?.[0]?.id;
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  return userId;
}

export async function GET() {
  try {
    const userId = await requireUserId();

    // Select exact columns to avoid "any" & mismatches
    const rows = await db
      .select({
        favorites: userPrefs.favorites,
        emojiMap: userPrefs.emojiMap,       // JSON/JSONB column in schema
        sidebarMode: userPrefs.sidebarMode, // 'compact' | 'expanded'
      })
      .from(userPrefs)
      .where(eq(userPrefs.userId, userId));

    if (!rows.length) {
      // no row yet → return defaults (UI can still show visual defaults)
      return NextResponse.json(DEFAULT_PREFS, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const { favorites, emojiMap, sidebarMode } = rows[0];
    return NextResponse.json(
      {
        favorites: favorites ?? [],
        emoji: (emojiMap as Record<string, string>) ?? {},
        mode: (sidebarMode as "compact" | "expanded") ?? "compact",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    if (err instanceof Response) return err; // rethrow 401
    console.error("[/api/me/prefs][GET] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();

    // Parse body safely
    const json = await req.json().catch(() => ({}));
    const parsed = Prefs.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const p = parsed.data;

    // Upsert by userId (must be UNIQUE or PK in your schema)
    await db
      .insert(userPrefs)
      .values({
        userId,
        favorites: p.favorites,
        emojiMap: p.emoji as Record<string, string>,
        sidebarMode: p.mode,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userPrefs.userId,
        set: {
          favorites: p.favorites,
          emojiMap: p.emoji as Record<string, string>,
          sidebarMode: p.mode,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err; // rethrow 401
    console.error("[/api/me/prefs][POST] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
