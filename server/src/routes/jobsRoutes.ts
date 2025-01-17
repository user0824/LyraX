// --------------------------------------------------------------------------------------
// > JOBS ROUTES < //
// --------------------------------------------------------------------------------------
import express, { Request, Response } from "express";
import { supabase } from "../utils/supabase";

const router = express.Router();

// --------------------------------------------------------------------------------------
// * CREATE JOB ROUTE
// --------------------------------------------------------------------------------------
router.post("/create", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, companyName, position, description, jobUrl, location } =
      req.body;
    console.log("Incoming body:", req.body);

    // * Insert into Jobs DB table
    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          user_id: req.body.userId,
          company_name: companyName,
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
