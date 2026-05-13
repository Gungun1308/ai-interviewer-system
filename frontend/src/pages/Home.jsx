export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-r from-blue-100 to-purple-100">
      <h1 className="text-5xl font-extrabold text-gray-900">
        Welcome to <span className="text-blue-600">AI Virtual Interviewer</span>
      </h1>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl">
        Upload your resume, take a real-time AI-powered interview, and get instant feedback with
        detailed performance analysis.
      </p>
      <div className="mt-8 space-x-4">
        <a
          href="/upload"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
        >
          Upload Resume
        </a>
        <a
          href="/interview"
          className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700"
        >
          Start Interview
        </a>
      </div>
    </section>
  );
}

