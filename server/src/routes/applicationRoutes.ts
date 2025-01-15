// --------------------------------------------------------------------------------------
// > APPLICATION ROUTES < //
// --------------------------------------------------------------------------------------
import express, { Request, Response } from "express";
import { supabase } from "../utils/supabase";

const router = express.Router();

// --------------------------------------------------------------------------------------
// * CREATE ROUTE
// --------------------------------------------------------------------------------------
router.post("/create", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, resumeId, jobId, status, appliedAt } = req.body;

    if (!userId || !resumeId || !jobId) {
      res
        .status(400)
        .json({ error: "Missing userId, resumeId, or jobId in request body" });
      return;
    }

    // * Insert into Applications  DB table
    const { data, error } = await supabase
      .from("applications")
      .insert([
        {
          user_id: userId,
          resume_id: resumeId,
          job_id: jobId,
          status: status || "pending",
          applied_at: appliedAt || new Date(),
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Error inserting application:", error);

      res.status(500).json({ error: "Failed to insert application" });
      return;
    }

    res.status(200).json({ application: data });
    return;
  } catch (err) {
    console.error("Unexpected error creating application:", err);
    res.status(500).json({ error: "Unexpected error creating application" });
    return;
  }
});

// --------------------------------------------------------------------------------------
// * EXPORT MODULE
// --------------------------------------------------------------------------------------
export default router;
