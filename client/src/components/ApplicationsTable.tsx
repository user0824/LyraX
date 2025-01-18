// --------------------------------------------------------------------------------------
// > APPLICATIONS TABLE COMPONENT < //
// --------------------------------------------------------------------------------------
import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { jsPDF } from "jspdf"; // ** PDF Export tool **

// Drop-down enumerations:
const COMMUTE_OPTIONS = ["Remote", "Hybrid", "On-site"];
const STATUS_OPTIONS = [
  "Pending",
  "Phone Interview",
  "Technical Interview",
  "Offer Negotiation",
  "Accepted",
  "Cancelled",
  "Rejected",
  "Declined",
];

// ------------------------------
// * SCHEMA INTERFACES
// ------------------------------
interface ApplicationsTableProps {
  userId: string;
}

interface Company {
  id: string;
  name: string;
}

interface Interview {
  id: string;
  interview_date?: string | null;
  notes?: string | null;
  outcome?: string | null;
}

interface Contact {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
}

interface Job {
  id: string;
  position: string;
  location?: string | null;
  commute?: string | null;
  company?: Company;
  interview?: Interview[]; // multiple
  contact?: Contact[]; // multiple
}

interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at?: string;
  salary_range?: string | null;
  prep?: string | null;
  improved_resume_text?: string | null;
  job?: Job | null;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({ userId }) => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --------------------------------------------------------------------------------------
  // * FETCH APPLICATIONS w/ multiple interviews, contacts
  // --------------------------------------------------------------------------------------
  const fetchApplications = React.useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          user_id,
          job_id,
          status,
          applied_at,
          salary_range,
          prep,
          improved_resume_text,
          job:jobs!applications_job_id_fkey!inner (
            id,
            position,
            location,
            commute,
            company:companies!jobs_company_id_fkey (
              id,
              name
            ),
            interview:interviews (
              id,
              interview_date,
              notes,
              outcome
            ),
            contact:contacts (
              id,
              name,
              phone,
              email
            )
          )
        `,
        )
        .eq("user_id", userId)
        .order("applied_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        setErrorMsg(error.message);
        return;
      }
      if (data) {
        setApps(data as Application[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMsg("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // --------------------------------------------------------------------------------------
  // * UPDATE APPLICATION
  // --------------------------------------------------------------------------------------
  const updateApplicationField = async (
    appId: string,
    fieldName: string,
    newValue: string | null,
  ) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .update({ [fieldName]: newValue })
        .eq("id", appId)
        .select("*");

      if (error) throw error;
      if (data && data.length > 0) {
        const updated = data[0];
        setApps((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, ...updated } : app)),
        );
      }
    } catch (err: unknown) {
      console.error("Error updating application:", err);
      setErrorMsg(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // --------------------------------------------------------------------------------------
  // * UPDATE JOB
  // --------------------------------------------------------------------------------------
  const updateJobField = async (
    jobId: string,
    fieldName: string,
    newValue: string | null,
  ) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .update({ [fieldName]: newValue })
        .eq("id", jobId)
        .select("*");

      if (error) throw error;
      if (data && data.length > 0) {
        const updatedJob = data[0];
        setApps((prev) =>
          prev.map((app) => {
            if (app.job?.id === jobId) {
              return { ...app, job: { ...app.job, ...updatedJob } };
            }
            return app;
          }),
        );
      }
    } catch (err) {
      console.error("Error updating job:", err);
      setErrorMsg("Failed to update job field.");
    }
  };

  // --------------------------------------------------------------------------------------
  // * UPDATE INTERVIEW
  // --------------------------------------------------------------------------------------
  const updateInterviewField = async (
    interviewId: string,
    fieldName: string,
    newValue: string | null,
  ) => {
    try {
      const { data, error } = await supabase
        .from("interviews")
        .update({ [fieldName]: newValue })
        .eq("id", interviewId)
        .select("*");

      if (error) throw error;
      if (data && data.length > 0) {
        const updatedIv = data[0];
        setApps((prev) =>
          prev.map((app) => {
            if (!app.job?.interview) return app;
            const updatedArray = app.job.interview.map((iv) =>
              iv.id === interviewId ? { ...iv, ...updatedIv } : iv,
            );
            return {
              ...app,
              job: { ...app.job, interview: updatedArray },
            };
          }),
        );
      }
    } catch (err) {
      console.error("Error updating interview:", err);
      setErrorMsg("Failed to update interview field.");
    }
  };

  // --------------------------------------------------------------------------------------
  // * UPDATE CONTACT
  // --------------------------------------------------------------------------------------
  const updateContactField = async (
    contactId: string,
    fieldName: string,
    newValue: string | null,
  ) => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .update({ [fieldName]: newValue })
        .eq("id", contactId)
        .select("*");

      if (error) throw error;
      if (data && data.length > 0) {
        const updatedContact = data[0];
        setApps((prev) =>
          prev.map((app) => {
            if (!app.job?.contact) return app;
            const updatedArr = app.job.contact.map((c) =>
              c.id === contactId ? { ...c, ...updatedContact } : c,
            );
            return {
              ...app,
              job: { ...app.job, contact: updatedArr },
            };
          }),
        );
      }
    } catch (err) {
      console.error("Error updating contact:", err);
      setErrorMsg("Failed to update contact field.");
    }
  };

  // --------------------------------------------------------------------------------------
  // * DOWNLOAD AI-UPDATED RESUME (as PDF)
  // --------------------------------------------------------------------------------------
  const downloadPDF = (resumeText: string | null | undefined) => {
    if (!resumeText) return;
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "letter" });
    const lines = doc.splitTextToSize(resumeText, 500);
    doc.text(lines, 50, 50);
    doc.save("AI_Updated_Resume.pdf");
  };

  // --------------------------------------------------------------------------------------
  // * USE EFFECT (FETCH)
  // --------------------------------------------------------------------------------------
  useEffect(() => {
    if (userId) fetchApplications();
  }, [userId, fetchApplications]);

  // --------------------------------------------------------------------------------------
  // * RETURN
  // --------------------------------------------------------------------------------------
  if (loading) return <div>Loading applications...</div>;
  if (errorMsg) return <div className="text-red-400">{errorMsg}</div>;

  return (
    // Outer container w/ the same login-like styling
    <div className="animate-fade-in-scale magic-card w-full rounded-2xl border border-none p-8 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-8 text-6xl font-bold text-white">Applications</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-white">
          <thead>
            <tr className="border-b border-white/20 text-center">
              <th className="app-dashboard-title">Date Applied</th>
              <th className="app-dashboard-title">Company</th>
              <th className="app-dashboard-title">Position</th>
              <th className="app-dashboard-title">Commute</th>
              <th className="app-dashboard-title">Location</th>
              <th className="app-dashboard-title">Status</th>
              <th className="app-dashboard-title">Salary Range</th>
              <th className="app-dashboard-title">Prep</th>
              <th className="app-dashboard-title bg-gradient-to-r from-pink-500 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
                AI Resume
              </th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <React.Fragment key={app.id}>
                {/* Main application row */}
                <tr className="border-b border-white/20 hover:bg-white/5">
                  {/* Date Applied */}
                  <td className="p-2">
                    {app.applied_at
                      ? new Date(app.applied_at).toLocaleDateString()
                      : ""}
                  </td>

                  {/* Company Name */}
                  <td className="p-2">{app.job?.company?.name || ""}</td>

                  {/* Position */}
                  <td className="p-2">{app.job?.position || ""}</td>

                  {/* Commute (dropdown) */}
                  <td className="p-2">
                    <select
                      className="app-dashboard-row"
                      value={app.job?.commute || ""}
                      onChange={(e) =>
                        updateJobField(
                          app.job?.id || "",
                          "commute",
                          e.target.value || null,
                        )
                      }
                    >
                      <option value="">--</option>
                      {COMMUTE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Location (editable) */}
                  <td className="p-2">
                    <input
                      className="app-dashboard-row"
                      type="text"
                      value={app.job?.location || ""}
                      onChange={(e) =>
                        updateJobField(
                          app.job?.id || "",
                          "location",
                          e.target.value || null,
                        )
                      }
                    />
                  </td>

                  {/* Status (dropdown) */}
                  <td className="p-2">
                    <select
                      className="app-dashboard-row"
                      value={app.status}
                      onChange={(e) =>
                        updateApplicationField(app.id, "status", e.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Salary Range (editable) */}
                  <td className="p-2">
                    <input
                      className="app-dashboard-row"
                      type="text"
                      value={app.salary_range || ""}
                      onChange={(e) =>
                        updateApplicationField(
                          app.id,
                          "salary_range",
                          e.target.value,
                        )
                      }
                    />
                  </td>

                  {/* Prep (editable) */}
                  <td className="p-2">
                    <input
                      className="app-dashboard-row"
                      type="text"
                      value={app.prep || ""}
                      onChange={(e) =>
                        updateApplicationField(app.id, "prep", e.target.value)
                      }
                    />
                  </td>

                  {/* AI Updated Resume (download button) */}
                  <td className="p-2">
                    <button
                      onClick={() => downloadPDF(app.improved_resume_text)}
                      className={`rounded-lg border border-white/20 bg-white/10 px-4 py-1 font-semibold text-white hover:bg-indigo-600/40 focus:outline-none ${
                        app.improved_resume_text
                          ? ""
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      {app.improved_resume_text ? "Download" : "No AI Resume"}
                    </button>
                  </td>
                </tr>

                {/* Interviews sub-rows (nest under job) */}
                {app.job?.interview?.map((iv) => (
                  <tr
                    key={iv.id}
                    className="border-b border-dashed border-white/10 bg-white/5 text-white"
                  >
                    <td className="p-2 text-right" colSpan={2}>
                      <strong>Interview Date:</strong>
                    </td>
                    <td className="p-2">
                      <input
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-white placeholder:text-white/50 hover:border-indigo-400/60 focus:border-indigo-400 focus:outline-none"
                        type="date"
                        value={iv.interview_date?.split("T")[0] || ""}
                        onChange={(e) =>
                          updateInterviewField(
                            iv.id,
                            "interview_date",
                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td className="p-2 text-right">
                      <strong>Outcome:</strong>
                    </td>
                    <td className="p-2">
                      <input
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-white placeholder:text-white/50 hover:border-indigo-400 focus:border-indigo-400 focus:outline-none"
                        type="text"
                        value={iv.outcome || ""}
                        onChange={(e) =>
                          updateInterviewField(iv.id, "outcome", e.target.value)
                        }
                      />
                    </td>

                    <td className="p-2 text-right">
                      <strong>Notes:</strong>
                    </td>
                    <td className="p-2" colSpan={4}>
                      <textarea
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-white placeholder:text-white/50 hover:border-indigo-400 focus:border-indigo-400 focus:outline-none"
                        rows={1}
                        value={iv.notes || ""}
                        onChange={(e) =>
                          updateInterviewField(iv.id, "notes", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}

                {/* Contacts sub-rows (nest under job) */}
                {app.job?.contact?.map((ct) => (
                  <tr
                    key={ct.id}
                    className="border-b border-dashed border-white/10 bg-white/5 text-white"
                  >
                    <td className="p-2 text-right" colSpan={2}>
                      <strong>Contact Name:</strong>
                    </td>
                    <td className="p-2">
                      <input
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-white placeholder:text-white/50 hover:border-indigo-400 focus:border-indigo-400 focus:outline-none"
                        type="text"
                        value={ct.name}
                        onChange={(e) =>
                          updateContactField(ct.id, "name", e.target.value)
                        }
                      />
                    </td>

                    <td className="p-2 text-right">
                      <strong>Phone:</strong>
                    </td>
                    <td className="p-2">
                      <input
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-white placeholder:text-white/50 hover:border-indigo-400 focus:border-indigo-400 focus:outline-none"
                        type="text"
                        value={ct.phone || ""}
                        onChange={(e) =>
                          updateContactField(ct.id, "phone", e.target.value)
                        }
                      />
                    </td>

                    <td className="p-2 text-right">
                      <strong>Email:</strong>
                    </td>
                    <td className="p-2" colSpan={4}>
                      <input
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-white placeholder:text-white/50 hover:border-indigo-400 focus:border-indigo-400 focus:outline-none"
                        type="email"
                        value={ct.email || ""}
                        onChange={(e) =>
                          updateContactField(ct.id, "email", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsTable;
