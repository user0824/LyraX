// ------------------------------------------------------------------------------------------------
// > RESUME ROUTES < //
// ------------------------------------------------------------------------------------------------
import express, { Request, Response } from "express";
import multer from "multer";
import pdf from "pdf-parse";
import { supabase } from "../utils/supabase";
import OpenAI from "openai";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Setup multer for in-memory file storage
const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ------------------------------------------------------------------------------------------------
// * INITIALIZE OPENAI
// ------------------------------------------------------------------------------------------------
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in .env");
}

// ------------------------------------------------------------------------------------------------
// * UPLOAD ROUTE - A RESUME FILE, PARSES IT, ANALYZES WITH OPENAI, AND SAVES INFO IN SUPABASE
// ------------------------------------------------------------------------------------------------
router.post(
  "/upload",
  upload.single("resume"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Incoming request body:", req.body); // !! DELETE !!
      console.log("Incoming file:", req.file); // !! DELETE !!

      const file = req.file;
      const userId = req.body.userId;

      if (!file) {
        console.error("No file was uploaded"); // !! DELETE !!
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      if (!userId) {
        console.error("userId not provided in request body"); // !! DELETE !!
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
      // * GENERATE A SIGNED URL (VALID 1 HOUR) - May not need this as i disabled RLS??
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
      // * CALL OPENAI FOR ANALYSIS - Test different models (davinci-002 model did not work)
      // ------------------------------------------------------------------------------------------------
      const analysisResponse = await openAi.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `Analyze the following resume and provide feedback:\n\n${resumeText}`,
          },
        ],
        max_tokens: 200,
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
            title: req.body.title || file.originalname.split(".")[0],
            content: resumeText, // the parsed PDF text
            file_url: file.originalname, // or your stored path
            ai_resume_analysis: analysisFeedback,
          },
        ]);

      if (dbError) {
        console.error("Error saving resume to database:", dbError);
        res.status(500).json({ error: "Failed to save resume" });
        return;
      }

      res.status(200).json({
        message: "Resume uploaded successfully",
        fileUrl: signedUrlData?.signedUrl,
        analysisFeedback,
      });

      console.log("Going to upload file with service role..."); // !! DELETE !!
      return;
    } catch (err) {
      console.error("Error processing resume:", err);
      res.status(500).json({ error: "Resume upload and processing failed" });
    }
    return;
  },
);

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default router;
