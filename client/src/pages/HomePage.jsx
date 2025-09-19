// frontend/src/pages/HomePage.jsx
import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple SVG icon for the header, you can replace this with your own
const HeaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11.956 2.022A.5.5 0 0011.5 2h-3a.5.5 0 00-.456.022l-.24.11a.5.5 0 00-.251.393L7.34 5.21a.5.5 0 00.493.59h4.334a.5.5 0 00.493-.59l-.213-2.684a.5.5 0 00-.251-.393l-.24-.11zM6.92 6.5l.494 6.205A.5.5 0 007.908 13h4.184a.5.5 0 00.494-.795L12.08 6.5H6.92zM7.5 14.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h5a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-5z" />
    </svg>
);


const HomePage = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();

    const handleContinue = () => {
        if (selectedRole === 'student') {
            navigate('/student');
        } else if (selectedRole === 'teacher') {
            navigate('/teacher');
        }
    };

    const RoleCard = ({ role, title, description }) => {
        const isSelected = selectedRole === role;

        // Render with a gradient border if selected
        if (isSelected) {
            return (
                <div
                    className="rounded-lg p-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 cursor-pointer shadow-lg"
                    onClick={() => setSelectedRole(role)}
                >
                    <div className="bg-white p-6 rounded-[7px]">
                        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{description}</p>
                    </div>
                </div>
            );
        }

        // Render with a standard border if not selected
        return (
            <div
                onClick={() => setSelectedRole(role)}
                className="p-6 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-300"
            >
                <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
                <p className="text-gray-500 text-sm mt-1">{description}</p>
            </div>
        );
    };

    return (
        // Added background color and adjusted vertical padding for better spacing
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">

            {/* Styled Header like the Figma design */}
            <div className="inline-flex items-center gap-2 bg-white shadow-sm rounded-full py-2 px-4 mb-10">
                <span className="text-purple-600">
                    <HeaderIcon />
                </span>
                <span className="font-semibold text-purple-600">Intervue Poll</span>
            </div>

            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">Welcome to the Live Polling System</h1>
                <p className="text-gray-600 mt-2">Please select the role that best describes you to begin using the live polling system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-2xl">
                <RoleCard
                    role="student"
                    title="I'm a Student"
                    description="Lorem ipsum is simply dummy text of the printing and typesetting industry."
                />
                <RoleCard
                    role="teacher"
                    title="I'm a Teacher"
                    description="Submit answers and view live poll results in real-time."
                />
            </div>

            <button
                onClick={handleContinue}
                disabled={!selectedRole}
                // Applied gradient, rounded-full for pill shape, and a subtle hover effect
                className="mt-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-16 rounded-full transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed hover:brightness-110 shadow-md"
            >
                Continue
            </button>
        </div>
    );
};

export default HomePage;