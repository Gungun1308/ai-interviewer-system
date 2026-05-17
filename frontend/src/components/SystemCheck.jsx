import React, { useEffect, useState } from "react";

export default function SystemCheck({ onComplete }) {
  const [checks, setChecks] = useState({
    camera: null,
    microphone: null,
    internet: null,
    bandwidth: null
  });

  const [loading, setLoading] = useState(true);
  const [allPassed, setAllPassed] = useState(false);

  useEffect(() => {
    const performChecks = async () => {
      const results = {
        camera: false,
        microphone: false,
        internet: false,
        bandwidth: false
      };

      // Check internet connection
      results.internet = navigator.onLine;

      // Check camera
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } }
        });
        cameraStream.getTracks().forEach(track => track.stop());
        results.camera = true;
      } catch (err) {
        console.error("Camera check failed:", err);
        results.camera = false;
      }

      // Check microphone
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getTracks().forEach(track => track.stop());
        results.microphone = true;
      } catch (err) {
        console.error("Microphone check failed:", err);
        results.microphone = false;
      }

      // Check bandwidth (simple check)
      try {
        const startTime = performance.now();
        const response = await fetch('/models/tiny_face_detector_model-weights_manifest.json');
        const endTime = performance.now();
        const timeTaken = endTime - startTime;
        results.bandwidth = timeTaken < 5000; // Good if loads in < 5s
      } catch (err) {
        console.error("Bandwidth check failed:", err);
        results.bandwidth = false;
      }

      setChecks(results);
      setAllPassed(Object.values(results).every(v => v === true));
      setLoading(false);
    };

    performChecks();
  }, []);

  const getStatusIcon = (status) => {
    if (status === null) return "⏳";
    if (status === true) return "✅";
    return "❌";
  };

  const getStatusColor = (status) => {
    if (status === null) return "text-gray-600";
    if (status === true) return "text-green-600 font-bold";
    return "text-red-600 font-bold";
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white p-8 rounded-lg shadow-md max-w-md">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">System Requirements Check</h3>
      
      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-300">Checking system requirements...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="space-y-4 mb-6">
            <div className={`flex items-center justify-between p-3 rounded ${checks.camera ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <span className="font-medium">Camera Access</span>
              <span className={getStatusColor(checks.camera)}>{getStatusIcon(checks.camera)}</span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded ${checks.microphone ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <span className="font-medium">Microphone Access</span>
              <span className={getStatusColor(checks.microphone)}>{getStatusIcon(checks.microphone)}</span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded ${checks.internet ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <span className="font-medium">Internet Connection</span>
              <span className={getStatusColor(checks.internet)}>{getStatusIcon(checks.internet)}</span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded ${checks.bandwidth ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <span className="font-medium">Bandwidth Speed</span>
              <span className={getStatusColor(checks.bandwidth)}>{getStatusIcon(checks.bandwidth)}</span>
            </div>
          </div>

          {!allPassed && (
            <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-700 p-4 rounded mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Some requirements are not met. Please ensure camera and microphone are enabled.
              </p>
            </div>
          )}

          {allPassed && (
            <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-700 p-4 rounded mb-6">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ All system requirements are ready!
              </p>
            </div>
          )}

          {onComplete && (
            <button
              onClick={() => onComplete(allPassed)}
              disabled={!allPassed}
              className={`w-full py-2 px-4 rounded font-medium transition ${
                allPassed
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed'
              }`}
            >
              {allPassed ? 'Continue to Interview' : 'Fix Issues to Continue'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
