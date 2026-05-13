import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-blue-600">AI Virtual Interviewer</h1>
      <div className="space-x-6">
        <Link to="/" className="hover:text-blue-600 font-medium">Home</Link>
        <Link to="/upload" className="hover:text-blue-600 font-medium">Upload Resume</Link>
        <Link to="/interview" className="hover:text-blue-600 font-medium">Start Interview</Link>
        <Link to="/result" className="hover:text-blue-600 font-medium">Result</Link>
      </div>
    </nav>
  );
}
