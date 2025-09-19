import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { FaPlus } from 'react-icons/fa';
import ParticipantsList from '../components/ParticipantsList';
import Chat from '../components/Chat';
import PollHistoryModal from '../components/PollHistoryModal';

// --- Helper Icons (can be moved to a separate file) ---
const HeaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11.956 2.022A.5.5 0 0011.5 2h-3a.5.5 0 00-.456.022l-.24.11a.5.5 0 00-.251.393L7.34 5.21a.5.5 0 00.493.59h4.334a.5.5 0 00.493-.59l-.213-2.684a.5.5 0 00-.251-.393l-.24-.11zM6.92 6.5l.494 6.205A.5.5 0 007.908 13h4.184a.5.5 0 00.494-.795L12.08 6.5H6.92zM7.5 14.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h5a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-5z" />
    </svg>
);
const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const socket = io("https://live-polling-system-b6jb.onrender.com", {
    transports: ["websocket"],
});

const TeacherView = () => {
    // State and helper functions are unchanged
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    const [timeLimit, setTimeLimit] = useState(60);
    const [pollState, setPollState] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [pollHistory, setPollHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('participants');
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    useEffect(() => {
        socket.emit('teacher:join');
        socket.on('update:participants', setParticipants);
        socket.on('update:results', (newPollState) => setPollState(newPollState));
        socket.on('update:chat', (newMessage) => setChatMessages(prev => [...prev, newMessage]));
        socket.on('update:pollHistory', setPollHistory);
        socket.on('teacher:joined', ({ pollHistory: initialHistory, participants: initialParticipants, chatMessages: initialChat }) => {
            setPollHistory(initialHistory);
            setParticipants(initialParticipants);
            setChatMessages(initialChat);
        });
        return () => {
            socket.off('update:participants');
            socket.off('update:results');
            socket.off('update:chat');
            socket.off('update:pollHistory');
            socket.off('teacher:joined');
        };
    }, []);
    const addOption = () => setOptions([...options, { text: '', isCorrect: false }]);
    const updateOption = (index, text) => {
        const newOptions = [...options];
        newOptions[index].text = text;
        setOptions(newOptions);
    };
    const setCorrectOption = (selectedIndex) => {
        setOptions(options.map((opt, i) => ({
            ...opt,
            isCorrect: i === selectedIndex,
        })));
    };
    const askQuestion = () => {
        if (question.trim() && options.every(opt => opt.text.trim()) && options.some(opt => opt.isCorrect)) {
            socket.emit('teacher:askQuestion', { question, options, timeLimit });
            setPollState({ question, options: options.map(o => ({ ...o, votes: 0 })), isLive: true });
        }
    };
    const askNewQuestion = () => {
        setPollState(null);
        setQuestion('');
        setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    };
    const totalVotes = pollState?.options.reduce((acc, opt) => acc + opt.votes, 0) || 0;


    // --- Live Poll / Results View (Styling updated) ---
    if (pollState) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
                <div className="w-full max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">{pollState.question}</h2>
                    <div className="space-y-4">
                        {pollState.options.map((option, index) => {
                            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                            return (
                                // --- FIX: Re-styled result bar to match student view ---
                                <div key={index} className="bg-white border-2 border-gray-200 rounded-lg h-14 relative">
                                    {/* Layer 1: Black Text */}
                                    <div className="absolute inset-0 flex items-center justify-between px-4">
                                        <span className="font-medium text-gray-800">
                                            {option.text}
                                            {option.isCorrect && <span className="font-bold text-green-600 ml-2">(Correct)</span>}
                                        </span>
                                        <span className="font-bold text-gray-800">{percentage.toFixed(0)}%</span>
                                    </div>
                                    {/* Layer 2: Purple Bar with White Text */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#6B5BF5] rounded-md flex items-center justify-between px-4 overflow-hidden"
                                        style={{ width: `${percentage}%` }}
                                    >
                                        <span className="font-medium text-white whitespace-nowrap">
                                            {option.text}
                                            {option.isCorrect && <span className="font-bold text-green-300 ml-2">(Correct)</span>}
                                        </span>
                                        <span className="font-bold text-white whitespace-nowrap">{percentage.toFixed(0)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-center items-center mt-8 space-x-4">
                        <button onClick={askNewQuestion} className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors">+ Ask a new question</button>
                        <button onClick={() => setIsHistoryVisible(true)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">View Poll History</button>
                    </div>
                </div>
                <div className="fixed right-8 bottom-24 w-80 bg-white shadow-xl rounded-lg border border-gray-200">
                    <div className="flex border-b">
                        <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 font-medium ${activeTab === 'chat' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Chat</button>
                        <button onClick={() => setActiveTab('participants')} className={`flex-1 py-2 font-medium ${activeTab === 'participants' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Participants</button>
                    </div>
                    <div className="p-4 h-96 overflow-y-auto">
                        {activeTab === 'chat' ? <Chat messages={chatMessages} user={{name: "Teacher"}} socket={socket} /> : <ParticipantsList participants={participants} socket={socket} />}
                    </div>
                </div>
                <PollHistoryModal isVisible={isHistoryVisible} onClose={() => setIsHistoryVisible(false)} history={pollHistory} />
            </div>
        );
    }

    // --- Create Poll View (Unchanged) ---
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full py-1.5 px-3 text-sm font-semibold mb-6">
                        <HeaderIcon />
                        <span>Intervue Poll</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800">Let's Get Started</h1>
                    <p className="text-gray-500 mt-2">
                        You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                    </p>
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold text-gray-700">Enter your question</label>
                            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 font-semibold rounded-full py-1.5 px-3 text-sm cursor-pointer">
                                {timeLimit} seconds
                                <ChevronDownIcon />
                            </div>
                        </div>
                        <div className="relative">
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Type your question here..."
                                className="w-full h-28 border border-gray-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                maxLength={100}
                            />
                            <span className="absolute bottom-3 right-3 text-sm text-gray-400">{question.length}/100</span>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Edit Options</h3>
                            <h3 className="font-semibold text-gray-700 mr-8">Is it Correct?</h3>
                        </div>
                        <div className="space-y-3 mt-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <span className="font-bold text-purple-700 bg-purple-100 rounded-full w-7 h-7 flex items-center justify-center text-sm flex-shrink-0">{index + 1}</span>
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    />
                                    <div className="flex items-center gap-4 text-sm">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name={`correct-option-${index}`} checked={option.isCorrect} onChange={() => setCorrectOption(index)} className="hidden" />
                                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${option.isCorrect ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
                                                {option.isCorrect && <span className="w-2 h-2 bg-white rounded-full"></span>}
                                            </span>
                                            Yes
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name={`correct-option-${index}`} checked={!option.isCorrect} onChange={() => setCorrectOption(index)} className="hidden" />
                                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!option.isCorrect ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
                                                 {!option.isCorrect && <span className="w-2 h-2 bg-white rounded-full"></span>}
                                            </span>
                                            No
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addOption}
                            className="text-green-600 font-semibold mt-4 flex items-center gap-2 border-2 border-green-500 rounded-lg py-2 px-4 transition-colors hover:bg-green-50"
                        >
                            <FaPlus size={12} /> <span>Add More option</span>
                        </button>
                    </div>
                </div>
                <div className="bg-white p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={askQuestion}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-12 rounded-full transition-all duration-300 hover:brightness-110 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!question.trim() || options.some(o => !o.text.trim()) || !options.some(o => o.isCorrect)}
                    >
                        Ask Question
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherView;