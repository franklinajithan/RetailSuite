import "dotenv/config";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

type Col = { table_name: string; column_name: string; data_type: string };

async function getType(table:string, col:string){
  const res:any = await db.execute(sql`
    select table_name, column_name, data_type
    from information_schema.columns
    where table_schema='public' and table_name=${table} and column_name=${col}
  `);
  return (res.rows?.[0] as Col | undefined)?.data_type;
}

async function alter(table:string, col:string, target:"integer"|"uuid"){
  const expr = target === "integer" ? sql`integer USING NULLIF(${sql.identifier(col)}::text,'')::integer`
                                    : sql`uuid USING NULL`;
  // using NULL is safe (tables are empty or will be backfilled)
  await db.execute(sql`ALTER TABLE ${sql.identifier(table)} ALTER COLUMN ${sql.identifier(col)} TYPE ${expr}`);
  console.log(`✔ Altered ${table}.${col} -> ${target}`);
}

async function main(){
  const userIdType = await getType("users","id");
  if (!userIdType) throw new Error("users.id not found");
  console.log("users.id type =", userIdType);

  const targets = [
    { t: "user_profiles", c: "user_id" },
    { t: "user_roles",    c: "user_id" },
    { t: "auth_logs",     c: "user_id" },
  ];

  for (const x of targets){
    const cur = await getType(x.t, x.c);
    if (!cur) { console.log(`(skip) ${x.t}.${x.c} not found`); continue; }
    if (cur !== userIdType){
      await alter(x.t, x.c, (userIdType === "uuid" ? "uuid" : "integer"));
    } else {
      console.log(`= OK ${x.t}.${x.c} (${cur})`);
    }
  }
}
main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });