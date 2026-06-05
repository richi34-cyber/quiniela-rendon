import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("SUPABASE_URL =", url);
console.log("SUPABASE_KEY =", key?.substring(0, 20));

export const supabase = createClient(url!, key!);