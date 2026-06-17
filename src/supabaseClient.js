import { createClient } from "@supabase/supabase-js";

// These are public values. The publishable key is safe to ship in the front end;
// your data is protected by Row Level Security in the database.
const SUPABASE_URL = "https://tdhrhnvessyrzrqtichc.supabase.co";
const SUPABASE_KEY = "sb_publishable_XpjxgecySCvm-x1hvCbldg_lbDEhS1q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
