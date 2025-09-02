import "dotenv/config";
import { Pool } from "pg";

async function getColumnType(client: any, table: string, column: string) {
  const { rows } = await client.query(
    `
    select data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = $1
      and column_name  = $2
    `,
    [table, column]
  );
  return rows[0]?.data_type ?? null; // 'integer' | 'uuid' | null
}

function castExpr(from: string, to: string) {
  // best-effort casts for dev environments
  if (from === to) return "user_id";
  if (to === "uuid") {
    // cast text -> uuid when text looks like uuid, else NULL
    return `NULLIF(user_id::text,'')::uuid`;
  }
  // to integer
  return `NULLIF(regexp_replace(user_id::text, '[^0-9]', '', 'g'),'')::integer`;
}

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- Detect the real type of users.id (uuid or integer)
    const usersIdType = await getColumnType(client, "users", "id");
    if (!usersIdType || !["uuid", "integer"].includes(usersIdType)) {
      throw new Error(
        `Could not determine users.id type. Got: ${usersIdType ?? "null"}`
      );
    }
    const fkType = usersIdType as "uuid" | "integer";

    // ---------- 1) USER PROFILES ----------
    // Create table with correct FK type
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id ${fkType} PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        full_name   text,
        avatar_url  text,
        phone       text,
        status      text NOT NULL DEFAULT 'active',
        timezone    text DEFAULT 'UTC',
        locale      text DEFAULT 'en',
        created_at  timestamptz NOT NULL DEFAULT now(),
        updated_at  timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Align column type if it already exists but mismatched
    const upUserIdType = await getColumnType(client, "user_profiles", "user_id");
    if (upUserIdType && upUserIdType !== fkType) {
      await client.query(`
        ALTER TABLE user_profiles
          DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
      `);
      await client.query(`
        ALTER TABLE user_profiles
          ALTER COLUMN user_id TYPE ${fkType}
          USING (${castExpr(upUserIdType, fkType)});
      `);
      await client.query(`
        ALTER TABLE user_profiles
          ADD CONSTRAINT user_profiles_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `);
    }

    // Ensure timestamps exist
    await client.query(`
      ALTER TABLE user_profiles
        ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
    `);

    // Helpful index for filtering by status
    await client.query(`
      CREATE INDEX IF NOT EXISTS user_profiles_status_idx ON user_profiles(status);
    `);

    // Ensure a profile row for every user (optional but handy)
    await client.query(`
      INSERT INTO user_profiles (user_id)
      SELECT u.id
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE p.user_id IS NULL;
    `);

    // ---------- 2) USER PREFS ----------
    // Create with correct FK type + expected columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_prefs (
        user_id ${fkType} PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        theme              text    NOT NULL DEFAULT 'system',
        density            text    NOT NULL DEFAULT 'normal',
        sidebar_collapsed  boolean NOT NULL DEFAULT false,
        favorites          text[]  NOT NULL DEFAULT '{}',
        quick_filters      jsonb   NOT NULL DEFAULT '{}'::jsonb,
        created_at         timestamptz NOT NULL DEFAULT now(),
        updated_at         timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Align type if needed
    const uprefUserIdType = await getColumnType(client, "user_prefs", "user_id");
    if (uprefUserIdType && uprefUserIdType !== fkType) {
      await client.query(`
        ALTER TABLE user_prefs
          DROP CONSTRAINT IF EXISTS user_prefs_user_id_fkey;
      `);
      await client.query(`
        ALTER TABLE user_prefs
          ALTER COLUMN user_id TYPE ${fkType}
          USING (${castExpr(uprefUserIdType, fkType)});
      `);
      await client.query(`
        ALTER TABLE user_prefs
          ADD CONSTRAINT user_prefs_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `);
    }

    // Ensure expected columns exist (covers the “favorites” error, etc.)
    await client.query(`
      ALTER TABLE user_prefs
        ADD COLUMN IF NOT EXISTS theme             text    NOT NULL DEFAULT 'system',
        ADD COLUMN IF NOT EXISTS density           text    NOT NULL DEFAULT 'normal',
        ADD COLUMN IF NOT EXISTS sidebar_collapsed boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS favorites         text[]  NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS quick_filters     jsonb   NOT NULL DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS created_at        timestamptz NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at        timestamptz NOT NULL DEFAULT now();
    `);

    // Seed prefs for users missing a row
    await client.query(`
      INSERT INTO user_prefs (user_id)
      SELECT u.id
      FROM users u
      LEFT JOIN user_prefs p ON p.user_id = u.id
      WHERE p.user_id IS NULL;
    `);

    await client.query("COMMIT");
    console.log("✅ DB patched successfully.");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Patch failed:", e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
