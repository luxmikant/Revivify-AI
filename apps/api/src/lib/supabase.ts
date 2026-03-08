import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supa")
    ? { rejectUnauthorized: false }
    : undefined,
});

// Create the analyses table on first connection (if it doesn't exist)
pool.query(`
  CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL,
    resume_text TEXT,
    jd_text TEXT,
    jd_title TEXT,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`).catch((err) => console.error("Table init error:", err));
