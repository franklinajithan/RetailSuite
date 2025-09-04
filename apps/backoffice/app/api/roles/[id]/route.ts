import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db/client";
import { roles } from "@/db/schema.usersec";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await db.delete(roles).where(eq(roles.id, params.id as any));
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
} 