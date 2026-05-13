import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ adminOnly=false, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // saved at login if available

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && role !== "admin") {
    return <div className="p-8 text-center">Admin access required.</div>;
  }
  if (children) return children;
  return <Outlet />;
}
