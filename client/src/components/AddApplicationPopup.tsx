// --------------------------------------------------------------------------------------
// > ADD APPLICATION POPUP < //
// --------------------------------------------------------------------------------------
import React, { useState, useRef } from "react";
import axios, { AxiosError } from "axios";
import ResumeUpload, { ResumeUploadRef } from "./ResumeUpload";

const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface Resume {
  id: string;
  title: string;
  content: string;
}

interface Company {
  id: string;
  user_id: string;
  name: string;
  industry?: string;
  notes?: string;
  created_at?: string;
}

interface AddApplicationPopupProps {
  userId: string;
  resumes: Resume[];
  companies: Company[];
  onClose: () => void;
  onRefreshData: () => void;
}

const AddApplicationPopup: React.FC<AddApplicationPopupProps> = ({
  userId,
  resumes,
  companies,
  onClose,
  onRefreshData,
}) => {
  // * RESUME SELECTION
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const resumeUploadRef = useRef<ResumeUploadRef>(null);

  // * COMPANY SELECTION
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");

  // * JOB FIELDS
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [dateApplied, setDateApplied] = useState("");

  // * UI STATES
  const [improvedResume, setImprovedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAddNewCompany = selectedCompanyId === "ADD_NEW";
  const isAddNewResume = selectedResumeId === "UPLOAD_NEW";

  // --------------------------------------------------------------------------------------
  // * SUBMIT
  // --------------------------------------------------------------------------------------
  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);

    console.log("==== SUBMIT START ====");
    try {
      let finalResumeId = selectedResumeId;
      let resumeContent = "";

      // ------------------------------------------------------------------
      // 1) If adding a new resume, trigger the upload via ResumeUpload ref
      // ------------------------------------------------------------------
      if (isAddNewResume) {
        if (resumeUploadRef.current) {
          console.log("Triggering resume upload...");
          await resumeUploadRef.current.uploadResume();
          await onRefreshData();

          const updatedResumes = await fetch(
            `${baseUrl}/api/resumes?userId=${userId}`,
          )
            .then((res) => res.json())
            .catch((err) => {
              console.error("Error fetching resumes after upload:", err);
              return [];
            });

          const latestResume = updatedResumes[0]; // newest first in array
          if (latestResume) {
            finalResumeId = latestResume.id;
            resumeContent = latestResume.content;
            console.log("Selected new resume ID:", finalResumeId);
          } else {
            throw new Error("Failed to retrieve the newly uploaded resume.");
          }
        } else {
          throw new Error("ResumeUpload component is not available.");
        }
      } else {
        // Using existing resume
        const resumeObj = resumes.find((r) => r.id === finalResumeId);
        if (resumeObj) {
          resumeContent = resumeObj.content;
        } else {
          throw new Error("Selected resume does not exist.");
        }
        console.log("Using existing resume ID:", finalResumeId);
      }

      // ------------------------------------------------------------------
      // 2) Create or select companyId
      // ------------------------------------------------------------------
      let finalCompanyId = selectedCompanyId;
      if (isAddNewCompany && newCompanyName.trim()) {
        console.log("Creating new company with name:", newCompanyName);
        const createRes = await axios.post(`${baseUrl}/api/companies/create`, {
          userId,
          name: newCompanyName.trim(),
        });
        finalCompanyId = createRes.data.company.id;
        console.log("New company created. finalCompanyId =", finalCompanyId);
      } else {
        console.log("Using existing companyId:", finalCompanyId);
      }

      // ------------------------------------------------------------------
      // 3) Create the job
      // ------------------------------------------------------------------
      console.log("Creating job with finalCompanyId =", finalCompanyId);
      const jobPayload = {
        userId,
        companyId: finalCompanyId,
        position,
        location,
        description: jobDesc,
        jobUrl,
      };
      console.log("jobPayload = ", jobPayload);

      const jobRes = await axios.post(`${baseUrl}/api/jobs/create`, jobPayload);
      console.log("jobRes.data =", jobRes.data);
      const createdJob = jobRes.data?.job;
      if (!createdJob) {
        throw new Error("Failed to create job record.");
      }
      console.log("Created job:", createdJob);

      // ------------------------------------------------------------------
      // 4) Create the application (so we have applicationId)
      // ------------------------------------------------------------------
      console.log("Creating application referencing jobId:", createdJob.id);
      const appPayload = {
        userId,
        resumeId: finalResumeId,
        jobId: createdJob.id,
        status: "pending",
        appliedAt: dateApplied,
      };
      console.log("appPayload =", appPayload);

      const applicationRes = await axios.post(
        `${baseUrl}/api/applications/create`,
        appPayload,
      );
      const createdApplication = applicationRes.data?.application;
      if (!createdApplication) {
        throw new Error("Failed to create application record.");
      }
      console.log("Created application:", createdApplication);

      // ------------------------------------------------------------------
      // 5) Improve the resume => pass applicationId
      // ------------------------------------------------------------------
      console.log("Improving resume for applicationId:", createdApplication.id);
      const improvePayload = {
        applicationId: createdApplication.id,
        jobDesc,
        resumeText: resumeContent,
      };
      console.log("improvePayload =", improvePayload);

      const improveRes = await axios.post(
        `${baseUrl}/api/resumes/improve`,
        improvePayload,
      );
      console.log("improveRes.data =", improveRes.data);
      const improvedText = improveRes.data?.improvedResume || "";

      // ------------------------------------------------------------------
      // 6) Done
      // ------------------------------------------------------------------
      setImprovedResume(improvedText);
      console.log("==== SUBMIT FINISH SUCCESS ====");
      onRefreshData();
      onClose();
    } catch (err) {
      const typedErr = err as AxiosError<{ error: string }>;
      console.error("==== Errors creating application ====");
      console.error(typedErr);
      setErrorMsg(
        typedErr.response?.data?.error ||
          typedErr.message ||
          "An unexpected error occurred",
      );
      console.log("==== SUBMIT FINISH ERROR ====");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------------------
  // * VALIDATION
  // --------------------------------------------------------------------------------------
  const jobFieldsFilled = position && location && jobDesc;
  const haveResume =
    (selectedResumeId && selectedResumeId !== "UPLOAD_NEW") ||
    (selectedResumeId === "UPLOAD_NEW" &&
      resumeUploadRef.current?.uploadResume);

  const haveCompany =
    (selectedCompanyId && !isAddNewCompany) ||
    (isAddNewCompany && newCompanyName.trim());

  const canSubmit = jobFieldsFilled && haveResume && haveCompany && !loading;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70">
      {/* MATCHING LOGINPOPUP WRAPPER STYLE */}
      <div
        className="animate-fade-in-scale w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-10 text-6xl font-bold text-white">Application</h2>

        {errorMsg && <p className="mb-2 text-red-500">{errorMsg}</p>}

        {/* RESUME DROPDOWN */}
        <label className="app-title">Resume</label>
        <select
          className="app-input"
          value={selectedResumeId}
          onChange={(e) => setSelectedResumeId(e.target.value)}
        >
          <option value="">Select a resume</option>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.title}
            </option>
          ))}
          <option value="UPLOAD_NEW">+ Add New Resume</option>
        </select>

        {/* SHOW ResumeUpload IF "ADD NEW RESUME" IS SELECTED */}
        {isAddNewResume && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-white/50">
              Upload your new resume:
            </p>
            <ResumeUpload
              ref={resumeUploadRef}
              onUploadSuccess={(newResume) => {
                console.log("New resume uploaded:", newResume);
                if (newResume) {
                  onRefreshData();
                  setSelectedResumeId(newResume.id);
                } else {
                  console.error(
                    "Received undefined resume from onUploadSuccess",
                  );
                }
              }}
            />
          </div>
        )}

        {/* COMPANY DROPDOWN */}
        <label className="app-title">Company</label>
        <select
          className="app-input"
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
        >
          <option value="">-- Select a Company --</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="ADD_NEW">+ Add New Company</option>
        </select>

        {/* SHOW INPUT FOR NEW COMPANY NAME IF "ADD NEW COMPANY" IS SELECTED */}
        {isAddNewCompany && (
          <input
            className="app-input"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            placeholder="Enter new company name"
          />
        )}

        {/* POSITION */}
        <label className="app-title">Position</label>
        <input
          className="app-input"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />

        {/* LOCATION */}
        <label className="app-title">Location</label>
        <input
          className="app-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {/* JOB POSTING URL */}
        <label className="app-title">Job Posting URL</label>
        <input
          className="app-input"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
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
          rows={4}
          className="app-input mb-10"
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />

        {/* SUBMIT & ANALYZE BUTTON */}
        <div className="flex justify-end space-x-0">
          <button
            onClick={onClose}
            className="w-32 rounded-tl-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-all duration-500 ease-out hover:bg-gray-600/30 focus:border-white/30 focus:outline-none"
          >
            Close
          </button>
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-40 rounded-br-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-all duration-500 ease-out ${
              canSubmit
                ? "hover:bg-indigo-600/40 focus:border-white/30 focus:outline-none"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            {loading ? "Processing..." : "Analyze"}
          </button>
        </div>

        {/* IMPROVED RESUME DISPLAY */}
        {/* {improvedResume && (
          <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm">
            <h3 className="mb-2 text-xl font-semibold text-indigo-200">
              Improved Resume:
            </h3>
            <pre className="whitespace-pre-wrap">{improvedResume}</pre>
          </div>
        )} */}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default AddApplicationPopup;
