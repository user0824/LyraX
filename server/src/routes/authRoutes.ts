// ------------------------------------------------------------------------------------------------
// > AUTH ROUTES < //
// ------------------------------------------------------------------------------------------------
import express, { Request, Response } from "express";
import { supabase } from "../utils/supabase";

const router = express.Router();
const returnUrl = process.env.BASE_URL || "http://localhost:5173/welcome";

// ------------------------------------------------------------------------------------------------
// * LOGOUT ROUTE - SIGNS OUT OF SUPABASE AND REDIRECT TO WELCOME PAGE
// ------------------------------------------------------------------------------------------------
router.get("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      res.status(500).send("Failed to logout");
      return;
    }
    res.redirect(returnUrl);
  } catch (err) {
    console.error("Logout Server Error:", err);
    res.status(500).send("An error occurred during logout");
  }
});

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default router;
