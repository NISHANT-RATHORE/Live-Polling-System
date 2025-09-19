// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import TeacherView from './pages/TeacherView';
import StudentView from './pages/StudentView';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-light-gray-bg text-gray-800">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/teacher" element={<TeacherView />} />
                    <Route path="/student" element={<StudentView />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;