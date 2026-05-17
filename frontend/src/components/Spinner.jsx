import React from 'react';

export default function Spinner({ size = 6, className = '' }) {
  const s = `${size}rem`;
  return (
    <div className={`inline-block animate-spin ${className}`} style={{ width: s, height: s }} aria-hidden="true">
      <svg viewBox="0 0 50 50" className="w-full h-full text-indigo-600 dark:text-indigo-400">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeOpacity="0.25"></circle>
        <path fill="currentColor" d="M45 25c0-11.046-8.954-20-20-20v6c7.732 0 14 6.268 14 14h6z"></path>
      </svg>
    </div>
  );
}
