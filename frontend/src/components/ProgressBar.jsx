import React from "react";

export default function ProgressBar({ currentQuestion, totalQuestions, timeLeft, questionTimeLimit }) {
  // Calculate progress percentage
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  // Time warning color
  const timeWarningColor = 
    timeLeft <= 10 ? 'text-red-600 font-bold' :
    timeLeft <= 20 ? 'text-yellow-600 font-bold' :
    'text-gray-700';

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm mb-6">
      {/* Question Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className={`text-sm ${timeWarningColor}`}>
            ⏱️ {timeLeft}s / {questionTimeLimit}s
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Question counter text */}
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
          {Math.round(progressPercentage)}% complete
        </div>
      </div>

      {/* Time indicator bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold">Time:</span>
        <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded h-1.5">
          <div
            className={`h-1.5 rounded transition-all ${
              timeLeft <= 10 ? 'bg-red-500' :
              timeLeft <= 20 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${(timeLeft / questionTimeLimit) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
