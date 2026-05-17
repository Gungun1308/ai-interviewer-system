import React, { useState } from "react";
import SystemCheck from "./SystemCheck";

export default function InstructionModal({ isOpen, onStart, onClose }) {
  const [systemCheckPassed, setSystemCheckPassed] = useState(false);
  const [step, setStep] = useState('instructions'); // 'instructions' or 'systemcheck'

  if (!isOpen) return null;

  const handleSystemCheckComplete = (passed) => {
    setSystemCheckPassed(passed);
    if (passed) {
      setStep('ready');
    }
  };

  const handleStartInterview = () => {
    if (systemCheckPassed) {
      onStart();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Instructions Step */}
        {step === 'instructions' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Interview Instructions</h2>

            <div className="space-y-4 mb-6">
              <div className="border-l-4 border-indigo-600 pl-4">
                <h3 className="font-semibold mb-2">📸 Camera & Audio</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your webcam will be on during the entire interview. Ensure proper lighting and a clear background.
                </p>
              </div>

              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold mb-2">🎙️ Voice Recording</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your responses will be recorded and analyzed. Speak clearly and avoid filler words.
                </p>
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold mb-2">⏱️ Time Limit</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Each question has 60 seconds. The timer will auto-advance to the next question when time is up.
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="font-semibold mb-2">🚫 No Cheating</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Tab switching, window focus loss, and multiple faces will be flagged as suspicious behavior.
                </p>
              </div>

              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-semibold mb-2">✅ Best Practices</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc ml-4 space-y-1">
                  <li>Find a quiet, well-lit location</li>
                  <li>Look at the camera while speaking</li>
                  <li>Avoid interruptions and distractions</li>
                  <li>Take a moment to think before answering</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('systemcheck')}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-medium"
              >
                Check System Requirements →
              </button>
            </div>
          </div>
        )}

        {/* System Check Step */}
        {step === 'systemcheck' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">System Requirements</h2>

            <SystemCheck onComplete={handleSystemCheckComplete} />

            {systemCheckPassed && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep('instructions')}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleStartInterview}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-bold"
                >
                  Start Interview 🚀
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
