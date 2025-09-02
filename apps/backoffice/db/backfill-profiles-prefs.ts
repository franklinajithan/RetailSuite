import "dotenv/config";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { userProfiles, userPrefs } from "@/db/schema.usersec";
import { sql } from "drizzle-orm";

async function main(){
  const missingProf:any = await db.execute(sql`
    select u.id from ${users} u
    left join ${userProfiles} p on p.user_id = u.id
    where p.user_id is null
  `);
  for(const r of (missingProf.rows ?? [])){
    await db.insert(userProfiles).values({ userId: r.id, status: "active" }).onConflictDoNothing();
  }
  console.log("Backfilled profiles:", missingProf.rows?.length ?? 0);

  const missingPrefs:any = await db.execute(sql`
    select u.id from ${users} u
    left join ${userPrefs} p on p.user_id = u.id
    where p.user_id is null
  `);
  for(const r of (missingPrefs.rows ?? [])){
    await db.insert(userPrefs).values({ userId: r.id }).onConflictDoNothing();
  }
  console.log("Backfilled prefs:", missingPrefs.rows?.length ?? 0);
}
main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });