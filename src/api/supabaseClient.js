import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://hhhvhptnxbmaekxxstey.supabase.co";
const supabaseAnonKey = "sb_publishable_vN2X6zlpfqO96q-cap_FPA_oKFXqBBW";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
