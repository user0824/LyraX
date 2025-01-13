import React from "react";

interface ResumeAnalysisProps {
  feedback: string | null;
}

// ------------------------------------------------------------------------------------------------
// > RESUME ANALYSIS COMPONENT < //
// ------------------------------------------------------------------------------------------------
const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ feedback }) => {
  // ------------------------------------------------------------------------------------------------
  // * RETURN
  // ------------------------------------------------------------------------------------------------
  return (
    <div>
      <div className="inline-flex w-full items-center justify-center">
        <hr className="my-8 h-px w-72 border-0 bg-indigo-400/70" />
      </div>
      <h2 className="bg-gradient-to-r from-pink-500 via-indigo-400 to-teal-400 bg-clip-text text-2xl font-bold text-transparent">
        AI Resume Feedback
      </h2>
      {feedback ? (
        <p>{feedback}</p>
      ) : (
        <p className="mt-2 text-gray-400">No feedback available yet.</p>
      )}
    </div>
  );
};

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default ResumeAnalysis;
