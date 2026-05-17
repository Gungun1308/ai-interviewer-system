import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/api/auth/signup", { name, email, password });
      const { token, role, id, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", id);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      toast.success("Signed up");
      navigate("/upload");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded transition-colors duration-300">
      <h2 className="text-2xl mb-4">Signup</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors duration-300" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors duration-300" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors duration-300" />
        <button disabled={loading} className="w-full bg-indigo-600 p-3 rounded text-white transition-colors duration-300">{loading ? "Signing..." : "Signup"}</button>
      </form>
    </div>
  );
}
