import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen((s) => !s)} className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">AI</div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">AI Virtual Interviewer</h1>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Home</Link>
          <Link to="/upload" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Upload Resume</Link>
          <Link to="/interview" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Start Interview</Link>
          <Link to="/result" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Result</Link>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          {token ? (
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('userId'); localStorage.removeItem('user'); navigate('/login'); }} className="ml-2 px-3 py-1 rounded bg-red-500 text-white">Logout</button>
          ) : (
            <Link to="/login" className="ml-2 px-3 py-1 rounded bg-indigo-600 text-white">Login</Link>
          )}
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="absolute left-4 right-4 top-16 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Link to="/" onClick={() => setOpen(false)} className="py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800">Home</Link>
              <Link to="/upload" onClick={() => setOpen(false)} className="py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800">Upload Resume</Link>
              <Link to="/interview" onClick={() => setOpen(false)} className="py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800">Start Interview</Link>
              <Link to="/result" onClick={() => setOpen(false)} className="py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800">Result</Link>
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => { toggleTheme(); setOpen(false); }} className="w-full text-left py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800">Theme: {theme}</button>
                <div className="mt-2">
                  {token ? (
                    <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('userId'); localStorage.removeItem('user'); setOpen(false); navigate('/login'); }} className="w-full text-left py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-red-500">Logout</button>
                  ) : (
                    <Link to="/login" onClick={() => setOpen(false)} className="w-full block py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800">Login</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
