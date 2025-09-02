import "dotenv/config";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

type Row = { data_type: string };

/** read column type */
async function colType(table:string, col:string){
  const res:any = await db.execute(sql`
    select data_type from information_schema.columns
    where table_schema='public' and table_name=${table} and column_name=${col}
  `);
  return (res.rows?.[0] as Row | undefined)?.data_type;
}

async function alterToInteger(table:string, col:string){
  await db.execute(sql`ALTER TABLE ${sql.identifier(table)}
    ALTER COLUMN ${sql.identifier(col)} TYPE integer USING (NULLIF(${sql.identifier(col)}::text,'')::integer)`);
  console.log("✔", table+"."+col, "-> integer");
}

async function alterToUuid(table:string, col:string){
  await db.execute(sql`ALTER TABLE ${sql.identifier(table)}
    ALTER COLUMN ${sql.identifier(col)} TYPE uuid USING (NULLIF(${sql.identifier(col)}::text,'')::uuid)`);
  console.log("✔", table+"."+col, "-> uuid");
}

async function main(){
  const uid = await colType("users","id");
  if (!uid) throw new Error("users.id not found");
  console.log("users.id =", uid);

  const targets = [
    ["user_profiles","user_id"],
    ["user_roles","user_id"],
    ["auth_logs","user_id"],
    ["user_prefs","user_id"],
  ] as const;

  for (const [t,c] of targets){
    const cur = await colType(t,c);
    if (!cur) continue;
    if (cur === uid) { console.log("= OK", t+"."+c, "("+cur+")"); continue; }
    if (uid === "uuid") await alterToUuid(t,c); else await alterToInteger(t,c);
  }
}
main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });