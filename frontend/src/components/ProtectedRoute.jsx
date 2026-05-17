import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ adminOnly=false, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // saved at login if available
  const isTokenValid = (t) => {
    if (!t) return false;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      if (payload.exp && typeof payload.exp === 'number') {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && role !== "admin") {
    return <div className="p-8 text-center">Admin access required.</div>;
  }
  if (children) return children;
  return <Outlet />;
}
