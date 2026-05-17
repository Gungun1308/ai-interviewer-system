import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import CircularChart from "../components/CircularChart";

export default function Result() {
  const report = JSON.parse(localStorage.getItem("lastReport") || "null");
  const reportRef = useRef(null);

  if (!report) return (
    <div className="text-center mt-12 p-6">
      <p className="text-gray-600">No result available. Complete an interview first.</p>
    </div>
  );

  const { result = {} } = report;

  // ✅ FEATURE 8: Download Report as PDF
  const downloadReport = () => {
    if (!reportRef.current) return;

    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `interview-report-${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade) => {
    if (grade === 'A') return 'bg-green-100 text-green-800';
    if (grade === 'B') return 'bg-blue-100 text-blue-800';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800';
    if (grade === 'D') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg shadow-lg transition-colors duration-300">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Interview Results</h2>
        <button
          onClick={downloadReport}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-medium"
        >
          📥 Download PDF Report
        </button>
      </div>

      {/* Cheating Flag Warning */}
      {result.cheatingFlag && (
        <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 rounded">
          <p className="text-red-800 font-bold">
            ⚠️ INTERVIEW FLAGGED AS SUSPICIOUS
          </p>
          <p className="text-red-700 text-sm mt-1">
            This interview has been marked as suspicious due to cheating indicators (tab switches, window blur events). Please review the interview integrity metrics below.
          </p>
        </div>
      )}

      {/* Printable Report Content */}
      <div ref={reportRef} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md transition-colors duration-300">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">AI Interview Report</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Interview Assessment & Analysis</p>
          <p className="text-sm text-gray-500 mt-3">{result.generatedAt ? new Date(result.generatedAt).toLocaleString() : 'Date not available'}</p>
        </div>

        {/* Overall Score Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border-2 border-indigo-200 flex items-center gap-6">
            <div>
              <p className="text-gray-700 font-semibold mb-3">Overall Score</p>
              <CircularChart value={result.score || 0} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Performance: {result.percentage || 0}%</p>
              <p className={`mt-3 text-2xl font-bold ${getScoreColor(result.score || 0)}`}>{result.score || 0}/100</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-200">
            <p className="text-gray-700 font-semibold mb-3">Grade</p>
            <div className={`inline-block px-6 py-3 rounded-lg text-2xl font-bold mb-3 ${getGradeColor(result.grade || 'N/A')}`}>
              {result.grade || "N/A"}
            </div>
            <p className="text-sm text-gray-600">
              Status: <span className={result.status === "Pass" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {result.status || "N/A"}
              </span>
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Technical Score */}
            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-600">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">Technical Knowledge</p>
                <span className="text-2xl font-bold text-blue-600">{result.technicalScore || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${result.technicalScore || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Communication Score */}
            <div className="bg-purple-50 p-4 rounded border-l-4 border-purple-600">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">Communication Skills</p>
                <span className="text-2xl font-bold text-purple-600">{result.communicationScore || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${result.communicationScore || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Attention Score */}
            <div className="bg-green-50 p-4 rounded border-l-4 border-green-600">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">Focus & Attention</p>
                <span className="text-2xl font-bold text-green-600">{result.attentionScore || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${result.attentionScore || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Integrity Score */}
            <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-600">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">Interview Integrity</p>
                <span className="text-2xl font-bold text-orange-600">{100 - (result.cheatingScore || 0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${100 - (result.cheatingScore || 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths */}
        {result.strengths && result.strengths.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">💪 Strengths</h3>
            <ul className="space-y-2">
              {Array.isArray(result.strengths) 
                ? result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-600 font-bold mr-3">✓</span>
                      <span className="text-gray-700">{s}</span>
                    </li>
                  ))
                : <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-3">✓</span>
                    <span className="text-gray-700">{result.strengths}</span>
                  </li>
              }
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {result.weaknesses && result.weaknesses.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Areas for Improvement</h3>
            <ul className="space-y-2">
              {Array.isArray(result.weaknesses)
                ? result.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-orange-600 font-bold mr-3">!</span>
                      <span className="text-gray-700">{w}</span>
                    </li>
                  ))
                : <li className="flex items-start">
                    <span className="text-orange-600 font-bold mr-3">!</span>
                    <span className="text-gray-700">{result.weaknesses}</span>
                  </li>
              }
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {result.suggestions && result.suggestions.length > 0 && (
          <div className="mb-8 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Recommendations for Improvement</h3>
            <ol className="space-y-3">
              {Array.isArray(result.suggestions)
                ? result.suggestions.map((s, i) => (
                    <li key={i} className="flex">
                      <span className="text-blue-600 font-bold mr-3">{i + 1}.</span>
                      <span className="text-gray-700">{s}</span>
                    </li>
                  ))
                : <li className="flex">
                    <span className="text-blue-600 font-bold mr-3">1.</span>
                    <span className="text-gray-700">{result.suggestions}</span>
                  </li>
              }
            </ol>
          </div>
        )}

        {/* Interview Metrics */}
        {result.answerCount !== undefined && (
          <div className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Interview Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Answers Provided</p>
                <p className="text-2xl font-bold text-gray-800">{result.answerCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cheating Score</p>
                <p className="text-2xl font-bold text-orange-600">{result.cheatingScore || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-2xl font-bold ${result.cheatingFlag ? 'text-red-600' : 'text-green-600'}`}>
                  {result.cheatingFlag ? 'Flagged' : 'Clean'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-600">
          <p>AI Virtual Interviewer - Comprehensive Assessment Report</p>
          <p className="mt-2">Generated by Advanced AI Interview System</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={downloadReport}
          className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-semibold"
        >
          📥 Download PDF Report
        </button>
        <a
          href="/upload"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
        >
          🔄 Take Another Interview
        </a>
        <a
          href="/"
          className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition font-semibold"
        >
          🏠 Back to Home
        </a>
      </div>
    </div>
  );
}
