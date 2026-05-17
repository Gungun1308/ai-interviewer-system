import React from 'react';

export default function CircularChart({ size = 120, stroke = 12, value = 0, color = '#4f46e5', bg = '#e6e7ff' }) {
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <linearGradient id="grad" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="url(#grad)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">{value}%</text>
    </svg>
  );
}
