import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-bold mb-4 text-gray-900 dark:text-white">404</h1>
      <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">Page not found. The route you requested does not exist.</p>
      <div className="flex gap-3">
        <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Go Home</Link>
        <Link to="/" className="px-4 py-2 bg-gray-200 dark:bg-gray-800 dark:text-white rounded hover:bg-gray-300">Return</Link>
      </div>
    </div>
  );
}
