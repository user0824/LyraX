// --------------------------------------------------------------------------------------
// > RESUME UPLOAD COMPONENT < //
// --------------------------------------------------------------------------------------

import React, { useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import ResumeAnalysis from "./ResumeAnalysis";
import { supabase } from "../utils/supabase";

interface ResumeUploadProps {
  onUploadSuccess: (resume: Resume) => void; // * CALLBACK WITH THE UPLOADED RESUME DATA
}

export interface ResumeUploadRef {
  uploadResume: () => Promise<void>;
}

interface Resume {
  id: string;
  title: string;
  content: string;
  improved_resume_text?: string;
}

const ResumeUpload = forwardRef<ResumeUploadRef, ResumeUploadProps>(
  ({ onUploadSuccess }, ref) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(
      null,
    );

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // * LIMIT FILE UPLOAD TO 5MB

    // * FILE CHANGE HANDLER
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      // * PDF VALIDATION
      if (!selectedFile.type.includes("pdf")) {
        setMessage("Please upload a PDF file.");
        setFile(null);
        return;
      }

      // * FILE SIZE VALIDATION
      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage("File size must be less than 5MB.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setMessage(null);
    };

    // * UPLOAD HANDLER
    const handleUpload = async () => {
      if (!file) {
        setMessage("Please select a file to upload.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        setMessage("User not authenticated. Please log in again.");
        return;
      }

      const title = file.name.split(".")[0];
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("title", title);
      formData.append("userId", user.id);

      try {
        setUploading(true);
        setMessage("Uploading...");

        console.log("Uploading resume:", file.name);
        const url = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/resumes/upload`;
        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Upload response:", response.data);

        if (response.status === 200) {
          setMessage("Resume uploaded successfully!");

          // * AI ANALYSIS FEEDBACK
          if (response.data?.analysisFeedback) {
            setAnalysisFeedback(response.data.analysisFeedback);
          }

          // * PASS THE UPLOADED RESUME DATA BACK TO THE PARENT
          onUploadSuccess(response.data.resume);
        } else {
          setMessage("Failed to upload resume. Please try again.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        setMessage("An unexpected error occurred. Please try again.");
      } finally {
        setUploading(false);
      }
    };

    // * EXPOSE THE UPLOADRESUME METHOD TO THE PARENT VIA REF
    useImperativeHandle(ref, () => ({
      uploadResume: handleUpload,
    }));

    return (
      <div className="p-4">
        {/* FILE PICKER */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="text-gray-400 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-indigo-400/70 file:p-2 file:text-white active:file:bg-indigo-500/70 disabled:cursor-not-allowed disabled:file:opacity-50"
          disabled={uploading}
        />

        {/* STATUS MESSAGE */}
        {message && <p className="mt-2 text-indigo-200">{message}</p>}

        {/* AI ANALYSIS FEEDBACK */}
        <ResumeAnalysis feedback={analysisFeedback} />
      </div>
    );
  },
);

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default ResumeUpload;
