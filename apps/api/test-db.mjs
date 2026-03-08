import { createClient } from "@supabase/supabase-js";

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await s.from("analyses").select("id").limit(1);
console.log("data:", JSON.stringify(data));
console.log("error:", error ? error.message : "none");
