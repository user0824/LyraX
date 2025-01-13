// ------------------------------------------------------------------------------------------------
// > SUPABASE CLIENT - INITIALIZE ENV VARIABLES < //
// ------------------------------------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration in .env");
}

// ------------------------------------------------------------------------------------------------
// * CREATE A BROWSER-BASED SUPABASE CLIENT
// ------------------------------------------------------------------------------------------------
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ------------------------------------------------------------------------------------------------
// * HELPER FUNC TO GET CURRENT USER'S ACCESS TOKEN FROM SUPABASE
// ------------------------------------------------------------------------------------------------
export async function getAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session) {
    console.error("Error fetching session:", error);
    return null;
  }
  return data.session.access_token;
}
