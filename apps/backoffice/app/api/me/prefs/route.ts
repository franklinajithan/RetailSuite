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

async function requireUserId(): Promise<number> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) throw new Response("Unauthorized", { status: 401 });

  const row = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  const userId = row?.[0]?.id as number | undefined;
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  return userId;
}

export async function GET() {
  try {
    const userId = await requireUserId();

    try {
      const rows = await db
        .select({
          favorites: userPrefs.favorites,
          emojiMap: userPrefs.emojiMap,
          sidebarMode: userPrefs.sidebarMode,
        })
        .from(userPrefs)
        .where(eq(userPrefs.userId, userId));

      if (!rows.length) {
        return NextResponse.json(DEFAULT_PREFS, { headers: { "Cache-Control": "no-store" } });
      }

      type PrefRow = {
        favorites: string[] | null;
        emojiMap: Record<string, string> | null;
        sidebarMode: "compact" | "expanded" | null;
      };
      const { favorites, emojiMap, sidebarMode } = rows[0] as PrefRow;
      return NextResponse.json(
        {
          favorites: favorites ?? [],
          emoji: (emojiMap as Record<string, string>) ?? {},
          mode: (sidebarMode as "compact" | "expanded") ?? "compact",
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (selectErr) {
      // schema mismatch (e.g., missing columns) → respond with defaults
      return NextResponse.json(DEFAULT_PREFS, { headers: { "Cache-Control": "no-store" } });
    }
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[/api/me/prefs][GET] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();

    const json = await req.json().catch(() => ({}));
    const parsed = Prefs.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
    }
    const p = parsed.data;

    try {
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
    } catch (upsertErr) {
      // schema mismatch → ignore write and still respond ok to unblock UI
      return NextResponse.json({ ok: true, note: "prefs table not migrated; using defaults" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[/api/me/prefs][POST] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
