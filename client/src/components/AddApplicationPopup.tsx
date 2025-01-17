import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import ResumeUpload from "./ResumeUpload";

const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// We no longer need the 'Resume' interface or 'resumes' prop
interface AddApplicationPopupProps {
  userId: string;
  onClose: () => void;
  onRefreshData: () => void;
}

const AddApplicationPopup: React.FC<AddApplicationPopupProps> = ({
  userId,
  onClose,
  onRefreshData,
}) => {
  // local states
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [dateApplied, setDateApplied] = useState("");

  // new state to store the uploaded resume text from `ResumeUpload`
  const [uploadedResumeText, setUploadedResumeText] = useState("");

  const [improvedResume, setImprovedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --------------------------------------------------------------------------------------
  // * HANDLER: Called by ResumeUpload to pass us the newly uploaded resume text
  // --------------------------------------------------------------------------------------
  const handleResumeUpload = (resumeText: string) => {
    setUploadedResumeText(resumeText);
  };

  // --------------------------------------------------------------------------------------
  // * APPLICATION SUBMIT HANDLER
  // --------------------------------------------------------------------------------------
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // 1) Create the job
      const jobPayload = {
        userId,
        companyName,
        position,
        location,
        description: jobDesc,
        jobUrl,
      };
      const jobRes = await axios.post(`${baseUrl}/api/jobs/create`, jobPayload);
      const createdJob = jobRes.data?.job;

      // 2) Improve resume
      //    We simply use the 'uploadedResumeText' (from the upload) + jobDesc
      const improvePayload = {
        jobDesc,
        resumeText: uploadedResumeText,
      };
      const improveRes = await axios.post(
        `${baseUrl}/api/resumes/improve`,
        improvePayload,
      );
      const improvedText = improveRes.data?.improvedResume || "";

      // 3) Create application entry
      const appPayload = {
        userId,
        // we no longer have a 'resumeId' since we're not referencing an existing resume
        // if needed, you can store the improved text or a new resume record in your DB
        jobId: createdJob.id,
        status: "pending",
        appliedAt: dateApplied,
      };
      await axios.post(`${baseUrl}/api/applications/create`, appPayload);

      setImprovedResume(improvedText);

      onRefreshData();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      console.error("Errors creating application", error);
      setErrorMsg(
        error.response?.data?.error || "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------------------
  // * RETURN
  // --------------------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-800 bg-opacity-60 backdrop-blur-sm">
      {/* POPUP CONTAINER */}
      <div className="bg-glassDark/5 w-full max-w-xl rounded-2xl border border-indigo-400/0 p-8 shadow-2xl">
        <h2 className="mb-8 text-6xl font-bold text-indigo-400">Application</h2>

        {errorMsg && <p className="mb-2 text-red-500">{errorMsg}</p>}

        {/* COMPANY */}
        <label className="app-title">Company</label>
        <input
          className="app-input"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          // placeholder="Enter company name"
        />

        {/* POSITION */}
        <label className="app-title">Position</label>
        <input
          className="app-input"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          // placeholder="Enter position"
        />

        {/* LOCATION */}
        <label className="app-title">Location</label>
        <input
          className="app-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          // placeholder="City, State"
        />

        {/* JOB POSTING URL */}
        <label className="app-title">Website</label>
        <input
          className="app-input"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          // placeholder="https://..."
        />

        {/* DATE APPLIED */}
        <label className="app-title">Date Applied</label>
        <input
          type="date"
          className="app-input"
          value={dateApplied}
          onChange={(e) => setDateApplied(e.target.value)}
        />

        {/* JOB DESCRIPTION */}
        <label className="app-title">Job Description</label>
        <textarea
          className="app-input"
          rows={4}
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          // placeholder="Paste the job description here..."
        />

        {/* RESUME UPLOAD ONLY (no dropdown) */}
        {/* <label className="app-title">Upload Resume</label> */}
        <ResumeUpload onUpload={handleResumeUpload} />
        {/* 'ResumeUpload' should call `props.onUpload(text)` once the file is read. */}

        {/* CANCEL BUTTON */}
        <div className="mt-4 flex justify-end gap-0">
          <button
            onClick={onClose}
            className="rounded-l-full bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-500/40 hover:text-gray-50"
          >
            Close
          </button>

          {/* SUBMIT BUTTON */}
          <button
            disabled={
              !uploadedResumeText ||
              !jobDesc ||
              !companyName ||
              !location ||
              !position ||
              loading
            }
            onClick={handleSubmit}
            className="rounded-r-full bg-gray-950 px-4 py-2 font-bold text-white hover:bg-indigo-600/40 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit & Analyze"}
          </button>
        </div>

        {/* SHOW IMPROVED RESUME */}
        {improvedResume && (
          <div className="mt-4 border p-2">
            <h3 className="font-semibold">Improved Resume:</h3>
            <pre className="whitespace-pre-wrap">{improvedResume}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddApplicationPopup;
