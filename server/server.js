// backend/server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity. In production, restrict this.
        methods: ["GET", "POST"],
    },
});

// --- STATE MANAGEMENT ---
let teacherSocketId = null;
let participants = []; // { id, name }
let pollState = {
    question: null,
    options: [], // { text, votes }
    voted: [], // List of socket.ids that have voted in the current poll
    isLive: false,
    resultsVisible: false,
    timer: null,
};
let pollHistory = []; // To store past polls
let chatMessages = [];
let pollTimerInterval = null;

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // --- ROLE IDENTIFICATION ---
    socket.on('teacher:join', () => {
        if (teacherSocketId) {
            // Optional: Handle case where a teacher might be reconnecting.
            // For now, we only allow one teacher session.
            socket.emit('error', 'A teacher is already connected.');
            return;
        }
        teacherSocketId = socket.id;
        socket.emit('teacher:joined', { pollHistory, participants, chatMessages });
        console.log('Teacher joined:', socket.id);
    });

    socket.on('student:join', (name) => {
        const participant = { id: socket.id, name };
        participants.push(participant);
        if (teacherSocketId) {
            io.to(teacherSocketId).emit('update:participants', participants);
        }
        socket.emit('student:joined', { pollState, chatMessages });
        console.log('Student joined:', name, socket.id);
    });

    // --- POLLING LOGIC ---
    socket.on('teacher:askQuestion', ({ question, options, timeLimit }) => {
        if (socket.id !== teacherSocketId) return;

        if (pollState.isLive) {
            clearInterval(pollTimerInterval);
        }

        pollState = {
            question,
            options: options.map(opt => ({ text: opt.text, votes: 0, isCorrect: opt.isCorrect })),
            voted: [], // CORRECTED: Reset the list of voters for the new poll
            isLive: true,
            resultsVisible: false,
            timer: timeLimit || 60,
        };


        io.emit('update:poll', {
            question: pollState.question,
            options: pollState.options.map(o => ({ text: o.text })),
            timer: pollState.timer,
            isLive: true // <-- ADD THIS LINE
        });

        pollTimerInterval = setInterval(() => {
            pollState.timer--;
            if (pollState.timer <= 0) {
                clearInterval(pollTimerInterval);
                pollState.isLive = false;
                pollState.resultsVisible = true;
                // Add the completed poll to the history
                pollHistory.unshift({ ...pollState, timestamp: new Date() });
                if (pollHistory.length > 50) pollHistory.pop(); // Cap history size

                io.emit('update:results', pollState); // Now send full results to everyone
                if (teacherSocketId) {
                    io.to(teacherSocketId).emit('update:pollHistory', pollHistory);
                }
            }
        }, 1000);

        console.log('New question asked:', question);
    });

    // --- REWRITTEN 'student:submitAnswer' HANDLER ---
    socket.on('student:submitAnswer', (optionIndex) => {
        // 1. Check if poll is live and if student has already voted
        if (!pollState.isLive || pollState.voted.includes(socket.id)) {
            return;
        }

        // 2. Validate the optionIndex to prevent crashes from bad data
        if (optionIndex < 0 || optionIndex >= pollState.options.length) {
            console.error(`Invalid optionIndex ${optionIndex} received from socket ${socket.id}`);
            return;
        }

        // 3. Record the vote and add the student's ID to the voted list
        pollState.options[optionIndex].votes++;
        pollState.voted.push(socket.id);

        // 4. FIX: Send live results ONLY to the teacher
        if (teacherSocketId) {
            io.to(teacherSocketId).emit('update:results', pollState);
        }
        console.log(`Answer received from ${socket.id}: option ${optionIndex}`);
    });

    // --- PARTICIPANT & CHAT MANAGEMENT (Unchanged) ---
    socket.on('teacher:kickStudent', (studentId) => {
        if (socket.id !== teacherSocketId) return;

        participants = participants.filter(p => p.id !== studentId);
        io.to(studentId).emit('student:kicked');
        io.to(teacherSocketId).emit('update:participants', participants);

        const kickedSocket = io.sockets.sockets.get(studentId);
        if (kickedSocket) {
            kickedSocket.disconnect(true);
        }
        console.log('Student kicked:', studentId);
    });

    socket.on('chat:sendMessage', ({ name, message }) => {
        const chatMessage = { name, message, timestamp: new Date() };
        chatMessages.push(chatMessage);
        if (chatMessages.length > 200) chatMessages.shift(); // Cap chat history size
        io.emit('update:chat', chatMessage);
    });

    // --- DISCONNECT LOGIC ---
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.id === teacherSocketId) {
            teacherSocketId = null;
            pollState = { question: null, options: [], voted: [], isLive: false, resultsVisible: false, timer: null };
            participants = [];
            chatMessages = [];
            clearInterval(pollTimerInterval);
            io.emit('teacher:left'); // Notify all clients
            console.log('Teacher disconnected. Session reset.');
        } else {
            participants = participants.filter(p => p.id !== socket.id);
            if (teacherSocketId) {
                io.to(teacherSocketId).emit('update:participants', participants);
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));