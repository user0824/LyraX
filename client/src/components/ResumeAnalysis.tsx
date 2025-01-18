// ------------------------------------------------------------------------------------------------
// > RESUME ANALYSIS COMPONENT < //
// ------------------------------------------------------------------------------------------------
import React from "react";
import ReactMarkdown from "react-markdown";

interface ResumeAnalysisProps {
  feedback: string | null;
}

const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ feedback }) => {
  console.log("ResumeAnalysis received feedback:", feedback);
  // ------------------------------------------------------------------------------------------------
  // * RETURN
  // ------------------------------------------------------------------------------------------------
  return (
    <div>
      {feedback ? (
        <section>
          <h2 className="mb-4 bg-gradient-to-r from-pink-500 via-indigo-400 to-teal-400 bg-clip-text text-2xl font-bold text-transparent">
            AI Resume Feedback
          </h2>
          <ReactMarkdown className="animate-fade-in space-y-5 text-left opacity-0">
            {feedback}
          </ReactMarkdown>
        </section>
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
