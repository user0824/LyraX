// --------------------------------------------------------------------------------------
// > JOBS ROUTES < //
// --------------------------------------------------------------------------------------
import express, { Request, Response } from "express";
import { supabase } from "../utils/supabase";

const router = express.Router();

// --------------------------------------------------------------------------------------
// * CREATE JOB ROUTE
// --------------------------------------------------------------------------------------
router.post("/create", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      companyId, // Now we expect an actual ID referencing 'companies'.
      position,
      description,
      jobUrl,
      location,
    } = req.body;

    // Insert the job referencing 'companyId'
    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          user_id: userId,
          company_id: companyId, // references 'companies(id)'
          position,
          description,
          jobUrl,
          location,
          created_at: new Date(),
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Error creating job" });
      return;
    }
    res.status(200).json({ job: data });
    return;
  } catch (err) {
    console.error("Unexpected error creating job:", err);
    res.status(500).json({ error: "Unexpected error" });
    return;
  }
});

// --------------------------------------------------------------------------------------
// * RETURN
// --------------------------------------------------------------------------------------
export default router;
