export async function POST() {
  // TODO: integrate email provider + token table
  return Response.json({ ok: true })
}
"

# ---------- utility to generate simple table page ----------
function New-ListPage(, , ) {
   = Join-Path C:\Users\Ajithan\Desktop\RetailSuite\apps\backoffice\app 
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
 = @"
'use client'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useEffect, useState } from 'react'

export default function Page(){
  const [rows, setRows] = useState<any[]>([])
  useEffect(()=>{ /* fetch here when API is ready */ },[])
  return (
    <div className='space-y-4'>
      <PageHeader title='' subtitle='' />
      <Card>
        <div className='flex gap-2 mb-3'>
          <Input placeholder='Search...' />
          <Button>New</Button>
        </div>
        <div className='overflow-auto'>
          <table className='table'>
            <thead><tr><th>ID</th><th>Name</th><th>Updated</th><th></th></tr></thead>
            <tbody>
              {rows.length===0 && <tr><td colSpan={4} className='text-neutral-500 py-8 text-center'>No data yet</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}