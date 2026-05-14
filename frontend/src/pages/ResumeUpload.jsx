import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [systemChecks, setSystemChecks] = useState({ camera: false, microphone: false, internet: false });
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [permissionPending, setPermissionPending] = useState(false);
  const [modalError, setModalError] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userId) {
      toast.error("Please login first");
      navigate("/login");
    }
  }, [userId, navigate]);

  const releaseMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const checkSystemRequirements = async () => {
    setPermissionPending(true);
    setModalError("");

    const checks = {
      camera: false,
      microphone: false,
      internet: navigator.onLine
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      checks.camera = true;
      checks.microphone = true;
    } catch (err) {
      console.error("System check failed", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setModalError("Please allow camera and microphone access.");
      } else {
        setModalError("Unable to access camera or microphone. Please allow permissions and try again.");
      }
      checks.camera = false;
      checks.microphone = false;
    }

    setSystemChecks(checks);
    setPermissionPending(false);
    return checks;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhotoPreview(dataUrl);
    setPhotoCaptured(true);
  };

  const startInterview = () => {
    const allChecks = Object.values(systemChecks).every(Boolean);
    if (!allChecks) {
      toast.error("Please allow camera, microphone, and internet before starting the interview.");
      return;
    }
    if (!photoCaptured) {
      toast.error("Please capture a photo before starting the interview.");
      return;
    }
    releaseMediaStream();
    setShowModal(false);
    navigate("/interview");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Upload a PDF or DOCX file");
      return;
    }
    if (!userId) {
      toast.error("User not found. Please login.");
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("resume", file);

      // 1️⃣ Upload resume
     await API.post(
  `/api/resume/upload/${userId}`,
  fd,
  {
    transformRequest: [(data) => data],
  }
);
      // 2️⃣ Generate questions and get interviewId
      const qres = await API.post(`/api/resume/generate-questions/${userId}`);
      const { skills, questions, interviewId } = qres.data;

      if (!interviewId) {
        toast.error("Interview ID missing from generation response. Please try again.");
        return;
      }
      if (!Array.isArray(questions) || !questions.length) {
        toast.error("No questions were generated. Please try again with a different resume.");
        return;
      }

      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText || q.question || String(q),
        skill: q.skill || "General",
        difficulty: q.difficulty || "Medium"
      }));

      localStorage.setItem("interviewId", interviewId);
      localStorage.setItem("questions", JSON.stringify(formattedQuestions));
      localStorage.setItem("skills", JSON.stringify(skills || []));

      toast.success("Resume processed and questions generated");
      await checkSystemRequirements();
      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Upload/generation failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-gray-200 p-6 rounded">
      <h2 className="text-2xl mb-4">Upload Resume</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl cursor-pointer shadow-md transition-all duration-200">
          Upload File
          <input
            type="file"
            accept="application/pdf,.pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
        </label>
        <div className="flex gap-2">
          <button disabled={uploading} className="bg-indigo-600 px-4 py-2 rounded text-white">
            {uploading ? "Processing..." : "Upload & Generate"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              localStorage.removeItem("questions");
              localStorage.removeItem("interviewId");
            }}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4 py-6">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Interview Instructions</h2>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4 text-gray-700">
                <p className="text-lg font-semibold">Please follow these rules before starting:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Do not use mobile devices during the interview</li>
                  <li>Do not switch tabs or minimize the browser</li>
                  <li>Stay in front of the camera at all times</li>
                  <li>Allow camera and microphone access when prompted</li>
                  <li>Photo capture will be taken before the interview begins</li>
                </ul>
                {modalError && (
                  <div className="rounded border border-red-300 bg-red-100 p-3 text-sm text-red-800">{modalError}</div>
                )}
              </div>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold mb-3">System check</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${systemChecks.camera ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    <span>Camera: {systemChecks.camera ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${systemChecks.microphone ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    <span>Microphone: {systemChecks.microphone ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${systemChecks.internet ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    <span>Internet: {systemChecks.internet ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={checkSystemRequirements}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
                    disabled={permissionPending}
                  >
                    {permissionPending ? 'Checking permissions…' : 'Check Camera & Microphone'}
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-full rounded-xl bg-yellow-500 px-4 py-3 text-white hover:bg-yellow-600"
                    disabled={!systemChecks.camera || !systemChecks.microphone}
                  >
                    Capture Photo
                  </button>
                  {photoCaptured && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                      Photo captured successfully. Ready to start.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={startInterview}
                className="rounded-2xl bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!photoCaptured || !Object.values(systemChecks).every(Boolean)}
              >
                Start Interview
              </button>
              <button
                type="button"
                onClick={() => { setShowModal(false); releaseMediaStream(); }}
                className="rounded-2xl bg-gray-200 px-6 py-3 text-gray-800 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            <video ref={videoRef} autoPlay muted playsInline className="hidden" />
            <canvas ref={canvasRef} className="hidden" />
            {photoPreview && (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 text-center">
                <p className="text-sm font-semibold mb-2">Captured photo preview</p>
                <img src={photoPreview} alt="Captured" className="mx-auto max-h-52 rounded-xl object-contain" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
