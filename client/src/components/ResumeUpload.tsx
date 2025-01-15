// TODO: Look into PDF validation check to ensure correct and safe file being uploaded

import React, { useState } from "react";
import axios from "axios";
import ResumeAnalysis from "./ResumeAnalysis";
import { supabase } from "../utils/supabase";

interface ResumeUploadProps {
  onUpload: () => void; // Prop to trigger parent refresh on successful upload
}

// ------------------------------------------------------------------------------------------------
// > RESUME ANALYSIS COMPONENT < //
// ------------------------------------------------------------------------------------------------
const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null); // Store selected file
  const [uploading, setUploading] = useState(false); // Track upload status
  const [message, setMessage] = useState<string | null>(null); // Display status messages
  const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // Limit uploads to 5MB

  // ------------------------------------------------------------------------------------------------
  // * RESUME SELECT HANDLER
  // ------------------------------------------------------------------------------------------------
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // * PDF check
    if (!selectedFile.type.includes("pdf")) {
      setMessage("Please upload a PDF file.");
      return;
    }
    // * Size check
    if (selectedFile.size > MAX_FILE_SIZE) {
      setMessage("File size must be less than 5MB.");
      return;
    }

    setFile(selectedFile);
    setMessage(null);
  };

  // ------------------------------------------------------------------------------------------------
  // * RESUME UPLOAD HANDLER
  // ------------------------------------------------------------------------------------------------
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const title = file.name.split(".")[0]; // get the name of resume (without pdf filename ext)
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("title", title);
    formData.append("userId", user?.id || "");

    try {
      setUploading(true);

      const url = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/resumes/upload`;
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setMessage("Resume uploaded successfully!");

        // * AI analysis text; stored in 'analysisFeedback'
        if (response.data?.analysisFeedback) {
          setAnalysisFeedback(response.data.analysisFeedback);
        }
        // * Refetch resumes
        onUpload();
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

  // ------------------------------------------------------------------------------------------------
  // * RETURN
  // ------------------------------------------------------------------------------------------------
  return (
    <div className="p-4">
      {/* Horizontal Layout */}
      <div className="flex items-center justify-center space-x-4">
        {/* FILE PICKER */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="text-gray-400 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-indigo-400/70 file:p-2 file:text-white active:file:bg-indigo-500/70 disabled:cursor-not-allowed disabled:file:opacity-50"
          disabled={uploading}
        />

        {/* UPLOAD BUTTON */}
        <button
          onClick={handleUpload}
          className={`h-max w-max cursor-pointer rounded-md border-0 bg-transparent p-2 ${
            uploading ? "pointer-events-none" : ""
          }`}
          disabled={uploading}
        >
          {uploading ? (
            <div className="m-[10px] flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-indigo-400 border-t-transparent"></div>
            </div>
          ) : (
            <img
              src="./src/assets/upload.svg"
              alt="upload"
              className="h-8 w-8" // Adjust size as needed
            />
          )}
        </button>
      </div>

      {/* STATUS MESSAGE */}
      {message && <p className="mt-2">{message}</p>}

      {/* AI ANALYSIS FEEDBACK */}
      <ResumeAnalysis feedback={analysisFeedback} />
    </div>
  );
};

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default ResumeUpload;
