import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import Spinner from "./components/Spinner";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResumeUpload = lazy(() => import("./pages/ResumeUpload"));
const Interview = lazy(() => import("./pages/Interview"));
const Result = lazy(() => import("./pages/Result"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // fetch current user and persist to localStorage (helps mobile browsers)
    (async () => {
      try {
        const res = await (await import('./api')).default.get('/auth/me');
        if (res?.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user));
      } catch (e) {
        // ignore - handled by interceptor
      }
    })();
  }, []);
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-black dark:bg-slate-950 dark:text-white transition-colors duration-300">
        <Navbar />
        <Toaster />
        <main className="container mx-auto p-4 transition-colors duration-300">
          <Suspense fallback={<div className="flex items-center justify-center py-12"><Spinner size={6} /></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/upload" element={<ResumeUpload />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/result" element={<Result />} />
              </Route>

              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPanel/></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ThemeProvider>
  );
}
