import React, { useState } from "react";
import axios from "axios";

const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const JobDescriptionForm = () => {
  const [jobDesc, setJobDesc] = useState("");

  const handleAnalyze = async () => {
    const { data } = await axios.post(`${baseUrl}/api/resume/improve`, {
      jobDesc,
    });
  };
  return (
    <div className="p-4">
      <textarea
        className="w-full border p-2"
        value="{ jobDesc }"
        onChange={(event) => setJobDesc(event.target.value)}
        placeholder="Paste job description here..."
      />
      <button
        onClick={handleAnalyze}
        className="mt-2 bg-green-500 p-2 text-white"
      >
        Analyze & Improve
      </button>
    </div>
  );
};

export default JobDescriptionForm;
