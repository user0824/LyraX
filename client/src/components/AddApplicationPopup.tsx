import React, { useState } from "react";
import axios, { AxiosError } from "axios";

const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface Resume {
  id: string;
  title: string;
  content: string;
  improved_resume_text?: string;
}

interface AddApplicationPopupProps {
  resumes: Resume[];
  userId: string;
  onClose: () => void;
  onRefreshData: () => void;
}

// --------------------------------------------------------------------------------------
// > ADD APPLICATION POPUP MODULE < //
// --------------------------------------------------------------------------------------
const AddApplicationPopup: React.FC<AddApplicationPopupProps> = ({
  resumes,
  userId,
  onClose,
  onRefreshData,
}) => {
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [dateApplied, setDateApplied] = useState("");

  const [improvedResume, setImprovedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --------------------------------------------------------------------------------------
  // * APPLICATION SUBMIT HANDLER
  // --------------------------------------------------------------------------------------
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

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

      const resumeObj = resumes.find(
        (resume) => resume.id === selectedResumeId,
      );

      const improvePayload = {
        resumeId: selectedResumeId,
        jobDesc,
        resumeText: resumeObj?.content || "",
      };

      const improveRes = await axios.post(
        `${baseUrl}/api/resumes/improve`,
        improvePayload,
      );
      const improvedText = improveRes.data?.improvedResume;

      const appPayload = {
        userId,
        resumeId: selectedResumeId,
        jobId: createdJob.id,
        status: "pending",
        appliedAt: dateApplied,
      };

      const appRes = await axios.post(
        `${baseUrl}/api/applications/create`,
        appPayload,
      );

      setImprovedResume(improvedText || "");

      onRefreshData();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      console.error("Erros creating application", error);
      setErrorMsg(error.response?.data?.error || "An unexpected error occured");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------------------
  // * RETURN
  // --------------------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-50">
      {/* POPUP CONTAINER */}
      <div className="w-full max-w-xl rounded-2xl border border-indigo-400/30 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="mb-4 text-2xl font-bold">Application</h2>

        {errorMsg && <p className="mb-2 text-red-500">{errorMsg}</p>}

        {/* RESUME DROPDOWN */}
        <label className="ml-2 mt-2 block text-left font-semibold">
          Resume
        </label>
        <select
          className="w-full rounded-xl border-none bg-black/30 p-2"
          value={selectedResumeId}
          onChange={(e) => setSelectedResumeId(e.target.value)}
        >
          <option value=""> Select a resume </option>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.title}
            </option>
          ))}
        </select>

        {/* COMPANY */}
        <label className="ml-2 mt-2 block text-left font-semibold">
          Company
        </label>
        <input
          className="w-full rounded-xl border-none bg-black/30 p-2"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          // placeholder="Enter company name"
        />

        {/* POSITION */}
        <label className="ml-2 mt-2 block text-left font-semibold">
          Position
        </label>
        <input
          className="w-full rounded-xl border-none bg-black/30 p-2"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          // placeholder="Enter position"
        />

        {/* LOCATION */}
        <label className="ml-2 mt-2 block text-left font-semibold">
          Location
        </label>
        <input
          className="w-full rounded-xl border-none bg-black/30 p-2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          // placeholder="Enter location"
        />

        {/* JOB POSTING URL */}
        <label className="ml-2 mt-2 block text-left font-semibold">
          Job Posting URL
        </label>
        <input
          className="w-full rounded-xl border-none bg-black/30 p-2"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          // placeholder="e.g. https://..."
        />

        {/* DATE APPLIED */}
        <label className="ml-2 mt-2 block text-left font-semibold">
          Date Applied
        </label>
        <input
          type="date"
          className="w-full rounded-xl border-none bg-black/30 p-2"
          value={dateApplied}
          onChange={(e) => setDateApplied(e.target.value)}
        />

        {/* JOB DESCRIPTION */}
        <label className="ml-2 mt-2 block text-left font-semibold">
          Job Description
        </label>
        <textarea
          className="w-full rounded-xl border-none bg-black/30 p-2"
          rows={4}
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          // placeholder="Paste the job description here..."
        />

        {/* CANCEL BUTTON */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 text-gray-700"
          >
            Cancel
          </button>
          {/* SUBMIT BUTTON */}
          <button
            disabled={
              !selectedResumeId ||
              !jobDesc ||
              !companyName ||
              !position ||
              loading
            }
            onClick={handleSubmit}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit & Analyze"}
          </button>
        </div>

        {/* SHOW IMPROVED RESUME - NOT WORKING BECAUSE POPUP CLOSES */}
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

// --------------------------------------------------------------------------------------
// * MODULE EXPORT
// --------------------------------------------------------------------------------------
export default AddApplicationPopup;
