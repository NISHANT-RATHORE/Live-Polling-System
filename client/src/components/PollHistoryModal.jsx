// frontend/src/components/PollHistoryModal.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const PollHistoryModal = ({ isVisible, onClose, history }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Poll History</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors">
                        <FaTimes size={22} />
                    </button>
                </div>

                {/* Modal Body with updated styling */}
                <div className="p-6 overflow-y-auto bg-slate-50">
                    {history.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No poll history available yet.</p>
                        </div>
                    ) : (
                        // We reverse the history to show the latest poll first
                        [...history].reverse().map((poll, pollIndex) => {
                            const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
                            return (
                                // Each poll is now a styled card
                                <div key={pollIndex} className="mb-6 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                                    {/* Dark Question Header */}
                                    <div className="bg-gray-800 text-white p-4">
                                        <p className="font-semibold text-lg">
                                            Q{history.length - pollIndex}: {poll.question}
                                        </p>
                                    </div>

                                    {/* Options List */}
                                    <div className="p-4 space-y-3">
                                        {poll.options.map((option, optionIndex) => {
                                            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                                            return (
                                                <div key={optionIndex} className="flex items-center gap-3">
                                                    {/* Numbered Circle */}
                                                    <span className="flex-shrink-0 bg-purple-600 text-white font-bold text-sm rounded-full w-7 h-7 flex items-center justify-center">
                                                        {optionIndex + 1}
                                                    </span>

                                                    {/* Result Bar Container */}
                                                    <div className="w-full bg-gray-200 rounded-md relative h-10 flex items-center overflow-hidden">
                                                        {/* The colored percentage bar */}
                                                        <div
                                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                        {/* Option Text (overlayed) */}
                                                        <span className="relative z-10 pl-3 font-medium text-gray-800">
                                                            {option.text}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default PollHistoryModal;