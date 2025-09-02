import "dotenv/config";
import { db } from "./client";
import { retailers, stores, users, products, storePrices } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
  const pw = await bcrypt.hash("admin123", rounds);

  const [retailer] = await db.insert(retailers).values({ name: "Demo Retailer" }).returning();
  const [store] = await db.insert(stores).values({ retailerId: retailer.id, name: "Central", code: "CENT" }).returning();

  await db.insert(users).values({
    email: "admin@example.com",
    name: "Admin",
    passwordHash: pw,
    role: "software_admin",
    retailerId: null as any
  }).onConflictDoNothing();

  const [p1] = await db.insert(products).values({ retailerId: retailer.id, sku: "SKU-100", name: "Sample Cola 330ml", barcode: "5449000131805" }).returning();
  await db.insert(storePrices).values({ retailerId: retailer.id, storeId: store.id, productId: p1.id, price: "0.99" });

  console.log("Seed complete. Admin user: admin@example.com / admin123");
}
main().then(()=>process.exit(0)).catch((e)=>{console.error(e);process.exit(1)});