import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./db/schema.ts", "./db/schema.usersec.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});