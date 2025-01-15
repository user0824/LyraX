import React, { useEffect, useState, useCallback } from "react";
import ResumeUpload from "./ResumeUpload";
import { supabase } from "../utils/supabase";
import Weather from "./Weather";
import { Session } from "@supabase/supabase-js";
import AddApplicationPopup from "./AddApplicationPopup";

interface DashboardProps {
  session: Session | null; // * match App.tsx
}

interface Resume {
  id: string;
  file_url: string;
  title: string;
  created_at: string;
  content: string;
  improved_resume_text?: string;
}

// --------------------------------------------------------------------------------------
// > DASHBOARD COMPONENT < //
// --------------------------------------------------------------------------------------
const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // --------------------------------------------------------------------------------------
  // * FETCH USER ID FROM SUPABASE AUTH
  // --------------------------------------------------------------------------------------
  const fetchUserId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      console.error("Error fetching user ID:", error);
      await supabase.auth.signOut(); // Log out client
      window.location.href = "/welcome";
      return;
    }
    setUserId(data.user.id);
  };

  // --------------------------------------------------------------------------------------
  // * FETCH RESUMES FOR THIS USER
  // --------------------------------------------------------------------------------------
  const fetchResumes = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching resumes:", error.message);
    } else {
      setResumes(data || []);
    }
  }, [userId]);

  // --------------------------------------------------------------------------------------
  // * LOGOUT HANDLER
  // --------------------------------------------------------------------------------------
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      localStorage.clear();
      window.location.href = `${window.location.origin}/welcome`;
    }
  };

  // --------------------------------------------------------------------------------------
  // * FETCH USER'S ID AND THEIR RESUME; CHECK FOR VALID SESSION
  // --------------------------------------------------------------------------------------
  useEffect(() => {
    fetchUserId();
  }, []);

  // once userId is set, fetch resumes
  useEffect(() => {
    if (userId) {
      fetchResumes();
    }
  }, [userId, fetchResumes]);

  // check session validity
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error("Invalid session or user deleted.");
        await supabase.auth.signOut();
        window.location.href = "/welcome";
      }
    };
    checkSession();
  }, []);

  // --------------------------------------------------------------------------------------
  // * DELETE RESUME
  // --------------------------------------------------------------------------------------
  const handleDeleteResume = async (resumeId: string, fileUrl: string) => {
    try {
      // * remove from storage
      const bucket = "resumes";
      await supabase.storage.from(bucket).remove([fileUrl]);

      // * remove from DB
      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", resumeId);

      if (error) {
        console.error("Delete resume error:", error.message);
        return;
      }

      // * re-fetch resumes
      await fetchResumes();
    } catch (err) {
      console.error("Unexpected error deleting resume:", err);
    }
  };

  // --------------------------------------------------------------------------------------
  // * SHOW/HIDE APPLICATION POPUP WINDOW
  // --------------------------------------------------------------------------------------
  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);

  // If you want to re-fetch data after the user submits the form
  const handleRefreshData = () => {
    // e.g., re-fetch resumes or applications
    fetchResumes();
    setShowPopup(false);
  };

  if (!session) {
    return <div>No session found!</div>;
  }

  // --------------------------------------------------------------------------------------
  // * RETURN
  // --------------------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 flex h-full w-full flex-col items-center">
      {/* HEADER */}
      <h1 className="ml-10 mt-7 self-start text-left text-7xl font-bold text-white">
        LYRA
        <span
          className="animate-fade-in align-sub text-5xl opacity-0 duration-500"
          style={{ animationDuration: "4s" }}
        >
          {"["}
        </span>
        <span
          className="animate-fade-in inline-block align-sub text-3xl text-indigo-400 opacity-0 duration-1000"
          style={{ animationDuration: "0.5s" }}
        >
          DASHBOARD
        </span>
        <span
          className="animate-fade-in align-sub text-5xl opacity-0"
          style={{ animationDuration: "4s" }}
        >
          {"]"}
        </span>
      </h1>
      <h1>Welcome, {session.user?.email}!</h1>

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="bg-glassLight/50 hover:bg-glassDark/50 absolute right-9 top-3 mt-4 cursor-pointer self-end rounded-xl border-none px-10 py-3 font-semibold text-white outline-none"
      >
        Logout
      </button>

      {/* Weather Example */}
      <section>
        <Weather />
      </section>

      {/* + APPLY TO JOB BUTTON */}
      <button onClick={handleOpenPopup} className="bg-blue-500 p-2 text-white">
        + Apply to Job
      </button>

      {/* POPUP FOR ADDING APPLICATION */}
      {showPopup && (
        <AddApplicationPopup
          resumes={resumes}
          userId={userId!}
          onClose={handleClosePopup}
          onRefreshData={handleRefreshData}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex flex-grow flex-col items-center justify-center">
        {/* RESUME UPLOAD */}
        <section className="bg-glass mt-6 w-full max-w-screen-sm rounded-xl p-4">
          <h2 className="text-lg font-bold text-white">Resume Upload</h2>
          <ResumeUpload onUpload={fetchResumes} />
        </section>

        {/* LIST OF RESUMES */}
        <section className="bg-glass mt-6 w-full max-w-screen-sm rounded-xl p-4">
          <h2 className="text-lg font-bold text-white">My Resumes</h2>

          {resumes.length > 0 ? (
            resumes.map((resume) => (
              <div key={resume.id} className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => handleDeleteResume(resume.id, resume.file_url)}
                  className="rounded-md bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                >
                  Delete
                </button>

                <a
                  // href={`${BUCKET_URL}/${resume.file_url}`} // direct link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {resume.title || "Untitled Resume"}
                </a>
                <span className="ml-auto text-sm text-gray-400">
                  {resume.created_at
                    ? new Date(resume.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            ))
          ) : (
            <p className="mt-2 text-gray-400">No resumes uploaded yet</p>
          )}
        </section>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------------
// * EXPORT MODULE
// --------------------------------------------------------------------------------------
export default Dashboard;
