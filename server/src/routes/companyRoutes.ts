// ------------------------------------------------------------------------------------------------
// > COMPANY ROUTES < //
// ------------------------------------------------------------------------------------------------
import express, { Request, Response } from "express";
import { supabase } from "../utils/supabase";

const router = express.Router();

// ------------------------------------------------------------------------------------------------
// * POST
// ------------------------------------------------------------------------------------------------
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { userId, name, industry, notes } = req.body;
    if (!userId || !name) {
      res.status(400).json({ error: "Missing userId or company name" });
      return;
    }

    // Insert into 'companies' table, returning the row with .select("*")
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          user_id: userId,
          name,
          industry: industry || null,
          notes: notes || null,
        },
      ])
      .select("*") // This ensures that "data" contains the newly inserted row with id, name, etc.
      .single(); // expect one row

    if (error) {
      throw error;
    }

    // * RETURN A NESTED OBJECT SO THE CLIENT CAN DO: CREATERES.DATA.COMPANY.ID
    res.status(201).json({ company: data });
    return;
  } catch (err) {
    console.error("Error creating company:", err);
    res.status(500).json({ error: "Could not create company" });
    return;
  }
});

// ------------------------------------------------------------------------------------------------
// * GET
// ------------------------------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ error: "Missing userId param" });
      return;
    }

    // * RETURN AN ARRAY OF ALL COMPANIES FOR THAT USER
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
      return;
    }

    res.json(data); // * an array of companies
    return;
  } catch (err) {
    console.error("Error retrieving companies:", err);
    res.status(500).json({ error: "Failed to retrieve companies" });
    return;
  }
});

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default router;
