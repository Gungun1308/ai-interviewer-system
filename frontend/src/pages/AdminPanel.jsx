import React, { useEffect, useState } from "react";
import API from "../api";

export default function AdminPanel() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/api/admin/candidates");
        setCandidates(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl mb-4">Admin — Candidates</h2>
      <div className="space-y-4">
        {candidates.map((c) => (
          <div key={c._id} className="bg-gray-200 p-4 rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{c.user?.name} ({c.user?.email})</div>
                <div className="text-sm text-gray-700">Resume processed: {c.isResumeProcessed ? "Yes" : "No"}</div>
              </div>
              <div className="text-right">
                <div>Latest Score: {c.latestReport ? c.latestReport.score : "N/A"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
