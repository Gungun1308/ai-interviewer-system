import React, { useState } from 'react';
import AudioRecorder from './AudioRecorder';

const VoiceInput = ({ questionIndex, currentAnswer, updateAnswer }) => {
    const [isVoiceMode, setIsVoiceMode] = useState(false);

    const handleRecordingComplete = (transcribedText) => {
        updateAnswer(questionIndex, transcribedText);
    };

    return (
        <div className="mt-4 p-4 border border-gray-200 rounded-xl shadow-inner bg-white">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-700">Answer Input</h4>
                <button
                    onClick={() => setIsVoiceMode(!isVoiceMode)}
                    className="text-sm font-medium text-primary hover:text-indigo-700 transition duration-200 flex items-center space-x-1"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM12.793 7.207a1 1 0 00-1.414 0L10 8.586 8.621 7.207a1 1 0 00-1.414 1.414L8.586 10l-1.414 1.414a1 1 0 001.414 1.414L10 11.414l1.379 1.379a1 1 0 001.414-1.414L11.414 10l1.414-1.414a1 1 0 000-1.414z" /></svg>
                    <span>{isVoiceMode ? 'Switch to Text Input' : 'Switch to Voice Input'}</span>
                </button>
            </div>
            
            {isVoiceMode ? (
                <div className="flex flex-col items-center py-4">
                    <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                    <p className="mt-4 text-sm text-gray-500 italic">
                        *Note: Transcription is simulated. Use the text area to edit/confirm your answer.
                    </p>
                </div>
            ) : (
                <textarea
                    rows="4"
                    value={currentAnswer}
                    onChange={(e) => updateAnswer(questionIndex, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition duration-200"
                ></textarea>
            )}
        </div>
    );
};

export default VoiceInput;