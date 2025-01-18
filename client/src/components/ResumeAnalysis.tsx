import React from "react";
import ReactMarkdown from "react-markdown";

interface ResumeAnalysisProps {
  feedback: string | null;
}

// ------------------------------------------------------------------------------------------------
// > RESUME ANALYSIS COMPONENT < //
// ------------------------------------------------------------------------------------------------
const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ feedback }) => {
  console.log("ResumeAnalysis received feedback:", feedback);
  // ------------------------------------------------------------------------------------------------
  // * RETURN
  // ------------------------------------------------------------------------------------------------
  return (
    <div>
      <div className="inline-flex w-full items-center justify-center">
        <hr className="my-8 h-px w-72 border-0 bg-indigo-400/70" />
      </div>

      {feedback ? (
        <section>
          <h2 className="mb-4 bg-gradient-to-r from-pink-500 via-indigo-400 to-teal-400 bg-clip-text text-2xl font-bold text-transparent">
            AI Resume Feedback
          </h2>
          {/* <p className="whitespace-pre-line">{feedback}</p> */}
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
