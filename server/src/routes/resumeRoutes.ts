// server/src/routes/resumeRoutes.ts

import express, { Request, Response } from "express";
import multer from "multer";
import pdf from "pdf-parse";
import { supabase } from "../utils/supabase";
import OpenAI from "openai";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Setup multer for in-memory file storage

// ------------------------------------------------------------------------------------------------
// * INITIALIZE OPENAI
// ------------------------------------------------------------------------------------------------
const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in .env");
}

// ------------------------------------------------------------------------------------------------
// > // UPLOAD ROUTE // - A RESUME FILE, PARSES IT, ANALYZES WITH OPENAI, AND SAVES INFO IN SUPABASE
// ------------------------------------------------------------------------------------------------
router.post(
  "/upload",
  upload.single("resume"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Incoming request body:", req.body); // Debug log
      console.log("Incoming file:", req.file); // Debug log

      const file = req.file;
      const userId = req.body.userId;

      if (!file) {
        console.error("No file was uploaded"); // Debug log
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      if (!userId) {
        console.error("userId not provided in request body"); // Debug log
        res.status(400).json({ error: "Missing userId in request body" });
        return;
      }

      const title = req.body.title || file.originalname.split(".")[0]; // Resume title (without pdf suffix)
      const uniqueFilename = `${Date.now()}-${file.originalname}`; // Unique filename to store in Supabase

      // ------------------------------------------------------------------------------------------------
      // * UPLOAD THE FILE TO SUPABASE STORAGE (E.G. "RESUMES" BUCKET)
      // ------------------------------------------------------------------------------------------------
      const { data: storageData, error: storageError } = await supabase.storage
        .from("resumes")
        .upload(`resumes/${uniqueFilename}`, file.buffer, {
          contentType: file.mimetype,
        });

      if (storageError) {
        console.error("Error uploading file to Supabase:", storageError);
        res.status(500).json({ error: "Failed to upload resume" });
        return;
      }

      // ------------------------------------------------------------------------------------------------
      // * GENERATE A SIGNED URL (VALID 1 HOUR)
      // ------------------------------------------------------------------------------------------------
      const { data: signedUrlData, error: signUrlError } =
        await supabase.storage
          .from("resumes")
          .createSignedUrl(`resumes/${uniqueFilename}`, 3600);

      if (signUrlError) {
        console.error("Error creating signed URL:", signUrlError);
        res.status(500).json({ error: "Failed to generate signed URL" });
        return;
      }

      // ------------------------------------------------------------------------------------------------
      // * PARSE PDF TEXT USING PDF-PARSE
      // ------------------------------------------------------------------------------------------------
      const pdfData = await pdf(file.buffer);
      const resumeText = pdfData.text || "";

      // ------------------------------------------------------------------------------------------------
      // * CALL OPENAI FOR ANALYSIS
      // ------------------------------------------------------------------------------------------------
      const analysisResponse = await openAi.chat.completions.create({
        model: "o1-mini",
        messages: [
          {
            role: "user",
            content: `Please provide a high level brief but complete AI feedback on the resume, no more than 150 words. Ensure you cover key sections like Clarity, Organization, Technical Skills, relevant achievements, and how best to optimize it to being ATS compliant, but keep it to 1–2 paragraphs. Analyze the following resume and provide feedback:\n\n${resumeText}`,
          },
        ],
      });

      const analysisFeedback =
        analysisResponse.choices?.[0]?.message?.content?.trim() ||
        "No feedback";

      // ------------------------------------------------------------------------------------------------
      // * INSERT INTO THE "RESUMES" TABLE, STORING THE AI FEEDBACK
      // ------------------------------------------------------------------------------------------------
      const { data: dbData, error: dbError } = await supabase
        .from("resumes")
        .insert([
          {
            user_id: userId,
            title,
            content: resumeText, // parsed PDF text
            file_url: uniqueFilename,
            ai_resume_analysis: analysisFeedback, // Short analysis summary
          },
        ])
        .select("*")
        .single();

      if (dbError) {
        console.error("Error saving resume to database:", dbError);
        res.status(500).json({ error: "Failed to save resume" });
        return;
      }

      console.log("Inserted Resume Data:", dbData);

      res.status(200).json({
        message: "Resume uploaded successfully",
        fileUrl: signedUrlData?.signedUrl,
        analysisFeedback,
        insertedResume: dbData,
      });

      console.log("Resume uploaded and processed successfully.");
      return;
    } catch (err) {
      console.error("Error processing resume:", err);
      res.status(500).json({ error: "Resume upload and processing failed" });
    }
    return;
  },
);

// ------------------------------------------------------------------------------------------------
// > // IMPROVE ROUTE // - AI REWRITE RESUME TO ALIGN W/JOB DESCRIPTION; STORE IN APPLICATIONS
// ------------------------------------------------------------------------------------------------
router.post("/improve", async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId, jobDesc, resumeText } = req.body;

    if (!applicationId || !jobDesc || !resumeText) {
      res.status(400).json({
        error:
          "Missing 'applicationId', 'jobDesc' and/or 'resumeText' in request body",
      });
      return;
    }

    // >>> CALL OPENAI TO IMPROVE RESUME <<<
    const response = await openAi.chat.completions.create({
      model: "o1-mini",
      messages: [
        {
          role: "user",
          content: `Here is a resume:\n\n${resumeText}\n\nJob Description:\n${jobDesc}\n\nRewrite this resume so it is ATS compliant and aligned with the job, without losing key details, Return the updated resume.`,
        },
      ],
    });

    const improvedResume = response.choices?.[0].message?.content?.trim() || "";

    const { data: updatedApp, error: updateError } = await supabase
      .from("applications")
      .update({ improved_resume_text: improvedResume })
      .eq("id", applicationId)
      .select("*")
      .single();

    if (updateError) {
      console.error(
        "Failed to update application with improved text:",
        updateError,
      );
      res
        .status(500)
        .json({ error: "Failed to store improved resume into DB" });
      return;
    }

    res.json({ improvedResume, application: updatedApp });
    return;
  } catch (err) {
    console.error("Error improving resume:", err);
    res.status(500).send("Error improving resume");
  }
});

// ------------------------------------------------------------------------------------------------
// * GET RESUMES ROUTE - FETCH RESUMES BY USER ID
// ------------------------------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      res.status(400).json({ error: "Missing or invalid userId parameter." });
      return;
    }

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database fetch error:", error);
      res.status(500).json({ error: "Failed to fetch resumes." });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching resumes:", err);
    res.status(500).json({ error: "Failed to fetch resumes." });
  }
});

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default router;
