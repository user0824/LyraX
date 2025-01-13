// ------------------------------------------------------------------------------------------------
// > SUPABASE SERVER - INITIALIZE ENV VARIABLES < //
// ------------------------------------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// ! Temporarily log them to confirm they’re correct DELETE!!!
console.log("SUPABASE_URL:", process.env.SUPABASE_URL); // !! DELETE !!
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
); // !! DELETE !!

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // !service role key not to be used in front-end

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase configuration in .env (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)",
  );
}

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
