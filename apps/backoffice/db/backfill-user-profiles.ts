import "dotenv/config";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { userProfiles } from "@/db/schema.usersec";
import { sql, eq } from "drizzle-orm";

async function main(){
  const res:any = await db.execute(sql`
    select u.id as id
    from ${users} u
    left join ${userProfiles} up on up.user_id = u.id
    where up.user_id is null
  `);
  const ids = res.rows?.map((r:any)=>r.id) ?? [];
  for (const id of ids) {
    await db.insert(userProfiles).values({ userId: id, status: "active" }).onConflictDoNothing();
  }
  console.log("Backfilled user_profiles:", ids.length);
}
main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1) });