// --------------------------------------------------------------------------------------
// > DASHBOARD COMPONENT < //
// --------------------------------------------------------------------------------------

import React, { useEffect, useState, useCallback } from "react";
// import ResumeUpload from "./ResumeUpload";
import { supabase } from "../utils/supabase";
import Weather from "./Weather";
import { Session } from "@supabase/supabase-js";
import AddApplicationPopup from "./AddApplicationPopup";
import axios from "axios";
import ResumeAnalysis from "./ResumeAnalysis"; // Import ResumeAnalysis
import ApplicationsTable from "./ApplicationsTable";

const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface DashboardProps {
  session: Session | null; // * match App.tsx
}

interface Resume {
  id: string;
  file_url: string;
  title: string;
  created_at: string;
  content: string;
  ai_resume_analysis?: string; // Short feedback from /upload
}

interface Company {
  id: string;
  user_id: string;
  name: string;
  industry?: string;
  notes?: string;
  created_at?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<string | null>(null); // State for AI feedback

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
      .eq("user_id", userId)
      .order("created_at", { ascending: false }); // newest first

    if (error) {
      console.error("Error fetching resumes:", error.message);
    } else {
      setResumes(data || []);
      if (data && data.length > 0) {
        const latestResume = data[0];
        console.log("Latest Resume:", latestResume); // Log for verification
        // This is just the short "analysis" from the upload route
        setLatestFeedback(latestResume.ai_resume_analysis || null);
      } else {
        setLatestFeedback(null);
      }
    }
  }, [userId]);

  // --------------------------------------------------------------------------------------
  // * FETCH COMPANIES FOR THIS USER
  // --------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(
          `${baseUrl}/api/companies?userId=${userId}`,
        );
        setCompanies(res.data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    if (userId) fetchCompanies();
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
  // * FETCH USER'S ID AND THEIR RESUMES; CHECK FOR VALID SESSION
  // --------------------------------------------------------------------------------------
  useEffect(() => {
    fetchUserId();
  }, []);

  // Once userId is set, fetch resumes
  useEffect(() => {
    if (userId) {
      fetchResumes();
    }
  }, [userId, fetchResumes]);

  // Check session validity
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
      // * Remove from storage
      const bucket = "resumes";
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([fileUrl]);

      if (storageError) {
        console.error(
          "Error removing file from storage:",
          storageError.message,
        );
        return;
      }

      // * Remove from DB
      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", resumeId);

      if (error) {
        console.error("Delete resume error:", error.message);
        return;
      }

      // * Re-fetch resumes
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
    fetchResumes();
    setShowPopup(false);
  };

  if (!session) {
    return <div>No session found!</div>;
  }

  // > JOB BANK <
  const jobSearch = [
    {
      name: "Linkedin",
      src: "./src/assets/linkedin2.svg",
      href: "https://www.linkedin.com",
      alt: "LinkedIn",
    },
    {
      name: "Indeed",
      src: "./src/assets/indeed2.svg",
      href: "https://www.indeed.com",
      alt: "Indeed",
    },
    {
      name: "Glassdoor",
      src: "./src/assets/glassdoor.svg",
      href: "https://www.glassdoor.com",
      alt: "Glassdoor",
    },
    {
      name: "TrueUp",
      src: "./src/assets/trueup.svg",
      href: "https://www.trueup.io",
      alt: "TrueUp",
    },
    {
      name: "Levels",
      src: "./src/assets/levels.svg",
      href: "https://www.levels.fyi",
      alt: "Levels",
    },
  ];

  // > SKILL BUILDING <
  const skillBuilding = [
    {
      name: "Leetcode",
      src: "./src/assets/leetcode.svg",
      href: "https://www.leetcode.com/",
      alt: "Leetcode",
    },
    {
      name: "Educative",
      src: "./src/assets/educative.svg",
      href: "https://www.educative.com/",
      alt: "Educative",
    },
  ];

  // --------------------------------------------------------------------------------------
  // * RETURN
  // --------------------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="flex h-[8vh] shrink-0 items-center justify-between px-4">
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
        <button
          onClick={handleLogout}
          className="absolute right-9 top-3 mt-4 cursor-pointer self-end rounded-md border-none bg-transparent px-12 py-4 text-2xl font-semibold text-white outline-none hover:bg-stone-800/20 hover:font-bold hover:text-indigo-400"
        >
          Logout
        </button>
      </header>

      {/* MAIN SECTION */}
      <main className="mt-5 h-[88vh] p-2 text-white">
        <div className="grid h-full grid-cols-[0fr_8fr_1fr] gap-6">
          {/* LEFT COLUMN */}
          <aside className="flex flex-col gap-2">
            {/* +APPLICATION BUTTON */}
            <section className="magic-card h-auto">
              <button
                onClick={handleOpenPopup}
                className="w-full rounded-2xl border-white/20 bg-white/10 px-16 text-lg font-bold text-white hover:bg-indigo-600/40"
              >
                NEW
              </button>
            </section>
            {/* RESUMES CARD */}
            <section className="magic-card h-auto">
              <h2 className="card-title">My Resumes</h2>
              <div className="space-y-3">
                {resumes.length > 0 ? (
                  resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <img
                        src="./src/assets/delete2.svg"
                        alt="delete"
                        onClick={() =>
                          handleDeleteResume(resume.id, resume.file_url)
                        }
                        className="cursor-pointer"
                      />
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-white hover:text-indigo-300"
                        href={`https://your-supabase-url/storage/v1/object/public/resumes/${resume.file_url}`} // Ensure correct URL
                      >
                        {resume.title || "Untitled Resume"}
                      </a>
                      <span className="ml-auto text-gray-400">
                        {resume.created_at
                          ? new Date(resume.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">
                    No resumes uploaded yet
                  </p>
                )}
              </div>
            </section>
            <section className="magic-card h-auto">
              <div className="mt-6">
                <ResumeAnalysis feedback={latestFeedback} />
              </div>
            </section>
          </aside>

          {/* MIDDLE COLUMN */}
          <section className="grid h-full grid-rows-[3fr_1fr] gap-2">
            {/* Top Row */}
            <div className="magic-card">
              <div className="mt-0">
                {userId && <ApplicationsTable userId={userId} />}
              </div>
              {/* ResumeUpload is managed via AddApplicationPopup */}
              {/* ResumeAnalysis Component */}
            </div>

            {/* Bottom Row - Two Columns */}
            <div className="grid grid-cols-2 gap-2">
              <div className="magic-card">
                <p className="card-title">C-Card2</p>
              </div>
              {/* RECENT ACTIVITY CARD */}
              <div className="magic-card">
                <h2 className="card-title">Recent Activity</h2>
                <div className="text-xs text-gray-300">
                  Activity feed or other content here
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <aside className="flex flex-col gap-2">
            {/* WEATHER COMPONENT */}
            <section className="magic-card h-auto">
              <Weather />
            </section>
            {/* JOB SEARCH LINKS */}
            <section className="magic-card h-auto">
              <p className="card-title">JOB SEARCH</p>
              <div className="mt-10 flex flex-col items-center justify-center gap-5">
                {jobSearch.map((website) => (
                  <a
                    key={website.name}
                    title={website.name}
                    href={website.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={website.src}
                      alt={website.alt}
                      className="h-20 scale-90 cursor-pointer p-1 transition-all duration-500 ease-in-out hover:scale-125"
                    />
                  </a>
                ))}
              </div>
            </section>
            {/* SKILL BUILDING */}
            <section className="magic-card h-auto">
              <p className="card-title">SKILL BUILDING</p>
              <div className="mt-10 flex flex-col items-center justify-center gap-5">
                {skillBuilding.map((skill) => (
                  <a
                    key={skill.name}
                    title={skill.name}
                    href={skill.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={skill.src}
                      alt={skill.alt}
                      className="h-20 scale-90 cursor-pointer p-1 transition-all duration-500 ease-in-out hover:scale-125"
                    />
                  </a>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mb-auto h-[4vh] shrink-0 px-0 text-center text-white">
        <p className="text-xs">© 2025 Amit. All rights reserved.</p>
      </footer>

      {/* POPUP */}
      {showPopup && (
        <AddApplicationPopup
          userId={userId!}
          resumes={resumes}
          companies={companies}
          onClose={handleClosePopup}
          onRefreshData={handleRefreshData}
        />
      )}
    </div>
  );
};

// --------------------------------------------------------------------------------------
// * EXPORT MODULE
// --------------------------------------------------------------------------------------
export default Dashboard;
