import React, { useState, useRef } from "react";

export default function AudioRecorder({ onTranscribed, onRecordingEnd }) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("SpeechRecognition API not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    recog.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0].transcript)
        .join(" ");
      onTranscribed(transcript);
    };

    recog.onerror = () => {
      setRecording(false);
    };

    recog.onend = () => {
      setRecording(false);
      // Callback when recording naturally ends
      if (onRecordingEnd) {
        onRecordingEnd();
      }
    };

    recognitionRef.current = recog;
    recog.start();
    setRecording(true);
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
    // Callback when user manually stops recording
    if (onRecordingEnd) {
      onRecordingEnd();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {!recording ? (
          <button onClick={startRecognition} className="bg-indigo-600 px-3 py-1 rounded text-white">
            🎙️ Start Recording
          </button>
        ) : (
          <button onClick={stopRecognition} className="bg-red-600 px-3 py-1 rounded text-white">
            ⏹️ Stop Recording
          </button>
        )}
      </div>
      <p className="text-sm text-gray-600">Speak clearly; your answer will be captured automatically.</p>
    </div>
  );
}
