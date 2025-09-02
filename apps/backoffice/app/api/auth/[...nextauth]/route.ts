import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "");
        const password = String(creds?.password ?? "");
        const [user] = await db.select().from(users).where(eq(users.email, email));
console.log('AUTH lookup', { email, found: !!user });
console.log('AUTH lookup', { email, found: !!user });
        if (!user) return null;
        const ok = await bcrypt.compare(password, (user as any).passwordHash);
console.log('AUTH check', { email, ok });
        if (!ok) return null;
        return { id: String(user.id), name: user.name ?? "User", email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
