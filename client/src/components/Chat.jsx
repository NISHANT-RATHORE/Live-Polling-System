// frontend/src/components/Chat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const Chat = ({ messages, user, socket }) => {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    useEffect(scrollToBottom, [messages]);


    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socket.emit('chat:sendMessage', { name: user.name, message });
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-3">
                        <p className="font-semibold text-sm text-gray-800">{msg.name}</p>
                        <p className="text-gray-600 bg-gray-100 p-2 rounded-lg inline-block">{msg.message}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="mt-auto pt-2 border-t">
                <div className="relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full border rounded-full p-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple">
                        <FaPaperPlane />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;