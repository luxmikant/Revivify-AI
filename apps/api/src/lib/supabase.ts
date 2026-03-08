import { createClient } from "@supabase/supabase-js";

// Uses Supabase REST API (HTTPS / IPv4) — works even when direct Postgres
// or the connection pooler are unreachable from this network.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
