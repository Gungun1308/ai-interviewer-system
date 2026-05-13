import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResumeUpload from "./pages/ResumeUpload";
import Interview from "./pages/Interview";
import Result from "./pages/Result";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Toaster />
      <main className="container mx-auto p-4">
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
      </main>
    </div>
  );
}
