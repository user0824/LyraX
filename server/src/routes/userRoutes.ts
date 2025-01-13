// ------------------------------------------------------------------------------------------------
// > USER ROUTES < //
// ------------------------------------------------------------------------------------------------

import express, { Request, Response } from "express";
import { supabase } from "../utils/supabase";

const router = express.Router();

// ------------------------------------------------------------------------------------------------
// * GET USERS FROM USERS TABLE IN DB
// ------------------------------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      console.error("Error fetching users:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch users. Please try again later." });
      return;
    }

    res.status(200).json(data);
    return;
  } catch (err) {
    console.error("Unexpected error fetching users:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
    return;
  }
});

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default router;
