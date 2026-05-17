import React, { useCallback, useEffect, useState, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import AudioRecorder from "../components/AudioRecorder";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";

const QUESTION_TIME = 60;

export default function Interview() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const interviewId = localStorage.getItem("interviewId");

  const [questions] = useState(() => {
    const savedQuestions = localStorage.getItem("questions");
    if (!savedQuestions) return [];
    try {
      const parsed = JSON.parse(savedQuestions);
      if (!Array.isArray(parsed)) throw new Error("questions is not an array");
      return parsed.map((q) => ({
        questionText: q.questionText || q.question || String(q),
        skill: q.skill || "General",
        difficulty: q.difficulty || "Medium"
      }));
    } catch (err) {
      console.error("Failed to parse stored questions:", err);
      localStorage.removeItem("questions");
      return [];
    }
  });

  const initialQuestions = questions;
  console.log("📋 Interview page loaded");
  console.log("   Questions count:", questions.length);
  questions.forEach((q, idx) => {
    const questionText = q.questionText || q.question || q;
    console.log(`   Q${idx + 1}: "${String(questionText).substring(0, 60)}..."`);
  });
  const [answers, setAnswers] = useState(() => Array(initialQuestions.length).fill(""));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [cheatCount, setCheatCount] = useState(0);
  const [suspicious, setSuspicious] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [transcript, setTranscript] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const autoAdvanceRef = useRef(null);

  const preventCopy = useCallback((e) => {
    e.preventDefault();
    setWarning("Copy-paste is disabled during the interview.");
  }, []);

  const handleNextQuestion = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev + 1 < questions.length) {
        setTimeLeft(QUESTION_TIME);
        setWarning("");
        return prev + 1;
      }
      clearTimer();
      toast.success("Interview complete. Submit your answers.");
      return prev;
    });
  }, [questions.length]);

  const handleRecordingEnd = useCallback(() => {
    // Auto-advance to next question after 1.5 seconds
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    
    autoAdvanceRef.current = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        console.log("🎯 Auto-advancing to next question...");
        handleNextQuestion();
      }
    }, 1500); // 1.5 second delay
  }, [currentIndex, questions.length, handleNextQuestion]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setCheatCount((prev) => {
        const next = prev + 1;
        if (next > 2) {
          setSuspicious(true);
          setWarning("Interview marked suspicious after multiple tab switches.");
        } else {
          setWarning("Do not switch tabs during the interview.");
        }
        return next;
      });
    }
  }, []);

  const startWebcam = async () => {
    try {
      // request both video and audio to ensure mic+cam permissions are prompted together
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Important: autoplay will be handled by the video element attribute
      }
      setCameraOn(true);
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          setCameraOn(false);
          setWarning("Webcam was turned off. Please keep it on.");
        };
      }
    } catch (error) {
      console.error("Webcam access denied:", error);
      setCameraOn(false);
      setWarning("Camera and microphone access are required. Please allow permissions and refresh the page.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
    setTimeLeft(QUESTION_TIME);
    setWarning("");
  };

  useEffect(() => {
    if (!userId || !interviewId || !questions.length) {
      toast.error("Please upload resume & generate questions first");
      navigate("/upload");
      return;
    }

    const startTimer = () => {
      clearTimer();
      setTimeLeft(QUESTION_TIME);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    };

    const initializeInterview = () => {
      startWebcam();
      startTimer();
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("copy", preventCopy);
    };

    initializeInterview();

    return () => {
      stopWebcam();
      clearTimer();
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", preventCopy);
    };
  }, [userId, interviewId, questions.length, navigate, handleVisibilityChange, preventCopy]);


  useEffect(() => {
    setTranscript(answers[currentIndex] || "");
    setTimeLeft(QUESTION_TIME);
  }, [currentIndex, answers]);

  useEffect(() => {
    if (timeLeft === 0) {
      toast.warning("Time is up. Moving to the next question.");
      handleNextQuestion();
    }
  }, [timeLeft, handleNextQuestion]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < questions.length - 1) {
          console.log("⌨️ Right arrow pressed - moving to next question");
          handleNextQuestion();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          console.log("⌨️ Left arrow pressed - moving to previous question");
          handlePreviousQuestion();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentIndex, questions.length, handleNextQuestion, handlePreviousQuestion]);

  const updateAnswer = (text) => {
    setTranscript(text);
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = text;
      return copy;
    });
  };

  const submit = async () => {
    if (!userId || !interviewId) {
      toast.error("Missing userId or interviewId");
      return;
    }

    if (!answers.some(a => a && a.trim())) {
      toast.error("Please answer at least one question");
      return;
    }

    setLoading(true);
    try {
      console.log("📤 Submitting interview with answers:", { userId, interviewId, answerCount: answers.length, suspicious });
      const res = await API.post("/api/interview/evaluate", {
        userId,
        interviewId,
        answers,
        suspicious
      });

      console.log("✅ Evaluation response:", res.data);
      const { feedback, result } = res.data;
      localStorage.setItem("lastReport", JSON.stringify({ feedback, result }));
      toast.success("Interview evaluated successfully");
      
      // Give webcam time to stop before navigating
      setTimeout(() => {
        navigate("/result");
      }, 500);
    } catch (error) {
      console.error("❌ Evaluation error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.msg || error.response?.data?.error || error.message || "Evaluation failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      stopWebcam();
      clearTimer();
    }
  };

  if (!questions.length) {
    return (
      <div className="text-center mt-8">
        No generated questions found. Upload resume first.
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded shadow-lg transition-colors duration-300" onCopy={preventCopy}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">AI Interview</h2>
            <p className="text-sm text-gray-600">Only voice answers are allowed for this session.</p>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-sm">Time left: {timeLeft}s</span>
            <span className="text-sm">Cheating attempts: {cheatCount}</span>
          </div>
        </div>

        <div className="rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-800 dark:text-blue-200 transition-colors duration-300">
          <p className="font-semibold mb-1">💡 Quick Tips:</p>
          <ul className="list-disc ml-5 text-xs">
            <li>After recording, question auto-advances in 1.5 seconds</li>
            <li>Use ← → arrow keys to navigate manually</li>
            <li>Time limit: 60 seconds per question</li>
          </ul>
        </div>

        {warning && (
          <div className="rounded border border-yellow-500 bg-yellow-100 p-3 text-yellow-800">
            {warning}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="bg-white dark:bg-gray-800 p-5 rounded shadow-sm transition-colors duration-300">
            <p className="font-medium text-lg mb-3 text-gray-900 dark:text-gray-100">{question?.questionText || "No question found"}</p>
            <div className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 text-gray-700 dark:text-gray-200">
              <p className="mb-1 text-sm text-gray-500">Skill: {question?.skill || "General"}</p>
              <p className="mb-1 text-sm text-gray-500">Difficulty: {question?.difficulty || "Medium"}</p>
            </div>

            <div className="mt-6 rounded border border-indigo-200 bg-indigo-50 p-4">
              <p className="font-semibold mb-2">Live transcript</p>
              <div className="min-h-[120px] whitespace-pre-wrap rounded border border-gray-300 bg-white p-3 text-sm text-gray-800">
                {transcript || "Speak now to record your answer..."}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <AudioRecorder onTranscribed={updateAnswer} onRecordingEnd={handleRecordingEnd} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded shadow-sm transition-colors duration-300">
            <p className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Camera status</p>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${cameraOn ? 'bg-green-600' : 'bg-red-600'}`}></span>
                <span>{cameraOn ? 'Camera is active' : 'Camera is inactive'}</span>
              </div>
            </div>
            <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3">
          <button
            type="button"
            onClick={handlePreviousQuestion}
            disabled={currentIndex === 0}
            className="rounded bg-gray-300 px-4 py-2 text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-400"
            title="Left arrow key or click"
          >
            ← Previous (←)
          </button>
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={currentIndex === questions.length - 1}
            className="rounded bg-indigo-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-700"
            title="Right arrow key or click"
          >
            Next (→) →
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="rounded bg-green-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-green-700"
          >
            {loading ? "Submitting..." : "✓ Submit Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}