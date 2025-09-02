import { db } from "@/db/client";
import { auditLogs } from "@/db/schema";
export async function audit({ retailerId, actorUserId, entity, entityId, action, data }:{
  retailerId?: number|null, actorUserId?: number|null, entity:string, entityId?: number|null, action:"create"|"update"|"delete", data?: any
}) {
  await db.insert(auditLogs).values({
    retailerId: retailerId ?? null as any,
    actorUserId: actorUserId ?? null as any,
    entity, entityId: entityId ?? null as any, action, data: data ? JSON.stringify(data).slice(0,4000) : null as any
  });
}