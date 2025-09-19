import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Timer from '../components/Timer'; // Assuming you have this component

// --- Helper Icons (can be moved to a separate file) ---
const HeaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11.956 2.022A.5.5 0 0011.5 2h-3a.5.5 0 00-.456.022l-.24.11a.5.5 0 00-.251.393L7.34 5.21a.5.5 0 00.493.59h4.334a.5.5 0 00.493-.59l-.213-2.684a.5.5 0 00-.251-.393l-.24-.11zM6.92 6.5l.494 6.205A.5.5 0 007.908 13h4.184a.5.5 0 00.494-.795L12.08 6.5H6.92zM7.5 14.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h5a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-5z" /></svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
);
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
);

const socket = io("https://live-polling-system-b6jb.onrender.com", {
    transports: ["websocket"],
});
const StudentView = () => {
    const [name, setName] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [pollState, setPollState] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isKicked, setIsKicked] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const totalVotes = pollState?.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

    useEffect(() => {
        socket.on('update:poll', (newPoll) => {
            setPollState({ ...newPoll, resultsVisible: false, options: newPoll.options.map(o => ({...o, votes: 0})) });
            setSelectedOption(null);
            setHasAnswered(false);
        });
        socket.on('update:results', (results) => {
            setPollState(prev => ({ ...prev, ...results, resultsVisible: true }));
        });
        socket.on('student:kicked', () => {
            setIsKicked(true);
            socket.disconnect();
        });
        socket.on('teacher:left', () => {
            setIsJoined(false);
            setPollState(null);
            setSelectedOption(null);
            setHasAnswered(false);
        });
        return () => {
            socket.off('update:poll');
            socket.off('update:results');
            socket.off('student:kicked');
            socket.off('teacher:left');
        };
    }, []);

    const handleJoin = (e) => {
        e.preventDefault();
        if (name.trim()) {
            socket.emit('student:join', name.trim());
            setIsJoined(true);
        }
    };

    const submitAnswer = () => {
        if (selectedOption !== null && !hasAnswered) {
            socket.emit('student:submitAnswer', selectedOption);
            setHasAnswered(true);
        }
    };

    if (isKicked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-white">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full py-1.5 px-3 text-sm font-semibold mb-6">
                    <HeaderIcon /> <span>Intervue Poll</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-800">You've been Kicked out !</h1>
                <p className="text-gray-500 mt-2 max-w-sm">Looks like the teacher had removed you from the poll system. Please try again sometime.</p>
            </div>
        );
    }

    if (!isJoined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full py-1.5 px-3 text-sm font-semibold mb-10">
                    <HeaderIcon /> <span>Intervue Poll</span>
                </div>
                <div className="w-full max-w-md text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Let's Get Started</h1>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">If you're a student, you'll be able to <b>submit your answers</b>, participate in live polls, and see how your responses compare with your classmates.</p>
                    <form onSubmit={handleJoin} className="mt-8 text-left">
                        <label className="font-semibold text-gray-700">Enter your Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-100 border-none rounded-lg p-4 mt-2 focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="Rahul Bajaj" />
                        <button type="submit" className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-full transition-all duration-300 hover:brightness-110 shadow-md disabled:opacity-50" disabled={!name.trim()}>Continue</button>
                    </form>
                </div>
            </div>
        );
    }

    if (!pollState || !pollState.question) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-white relative">
                <div className="absolute top-8">
                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full py-1.5 px-3 text-sm font-semibold">
                        <HeaderIcon /> <span>Intervue Poll</span>
                    </div>
                </div>
                <svg className="animate-spin h-16 w-16 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h1 className="text-2xl font-semibold mt-4 text-gray-700">Wait for the teacher to ask questions..</h1>
                <button onClick={() => setIsChatVisible(true)} className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-transform hover:scale-110">
                    <ChatIcon />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-white">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700">Question {pollState.questionNumber || 1}</h2>
                    <div className="flex items-center gap-2 text-red-500 font-semibold">
                        <ClockIcon />
                        {pollState.isLive && <Timer initialTime={pollState.timer} />}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100 overflow-hidden">
                    <div className="bg-gray-800 text-white font-semibold p-4">{pollState.question}</div>
                    <div className="p-4 space-y-3">
                        {pollState.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            if (pollState.resultsVisible) {
                                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className={`flex-shrink-0 font-bold text-sm rounded-full w-7 h-7 flex items-center justify-center ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{index + 1}</span>
                                        <div className="flex-grow bg-white border-2 border-gray-200 rounded-lg h-12 relative">
                                            {/* Layer 1: Black Text (Visible on white background) */}
                                            <div className="absolute inset-0 flex items-center justify-between px-3">
                                                <span className="font-medium text-gray-800">{option.text}</span>
                                                <span className="font-bold text-gray-800">{percentage.toFixed(0)}%</span>
                                            </div>
                                            {/* Layer 2: Purple Bar with White Text (Clipped to percentage width) */}
                                            <div
                                                className="absolute top-0 left-0 h-full bg-[#6B5BF5] rounded-md flex items-center justify-between px-3 overflow-hidden"
                                                style={{ width: `${percentage}%` }}
                                            >
                                                <span className="font-medium text-white whitespace-nowrap">{option.text}</span>
                                                <span className="font-bold text-white whitespace-nowrap">{percentage.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            if (hasAnswered) {
                                return (
                                    <div key={index} className={`w-full text-left p-2 rounded-lg border-2 transition-all flex items-center gap-3 ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 opacity-60'}`}>
                                        <span className={`flex-shrink-0 font-bold text-sm rounded-full w-7 h-7 flex items-center justify-center ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{index + 1}</span>
                                        <span className="font-medium">{option.text}</span>
                                    </div>
                                );
                            }

                            return (
                                <button key={index} onClick={() => setSelectedOption(index)} className={`w-full text-left p-2 rounded-lg border-2 transition-all flex items-center gap-3 ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                                    <span className={`flex-shrink-0 font-bold text-sm rounded-full w-7 h-7 flex items-center justify-center ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{index + 1}</span>
                                    <span className="font-medium">{option.text}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    {!hasAnswered && !pollState.resultsVisible ? (
                        <button onClick={submitAnswer} disabled={selectedOption === null} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-16 rounded-full transition-all duration-300 hover:brightness-110 shadow-md disabled:opacity-50">
                            Submit
                        </button>
                    ) : hasAnswered && !pollState.resultsVisible ? (
                        <p className="font-semibold text-purple-700">Answer submitted! Waiting for results...</p>
                    ) : (
                        <p className="font-semibold text-gray-500">Wait for the teacher to ask a new question.</p>
                    )}
                </div>
            </div>

            <button onClick={() => setIsChatVisible(true)} className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-transform hover:scale-110">
                <ChatIcon />
            </button>
        </div>
    );
};

export default StudentView;