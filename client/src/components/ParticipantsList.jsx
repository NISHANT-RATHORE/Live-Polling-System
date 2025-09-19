// frontend/src/components/ParticipantsList.jsx
import React from 'react';

const ParticipantsList = ({ participants, socket }) => {
    const kickStudent = (id) => {
        socket.emit('teacher:kickStudent', id);
    };

    return (
        <div>
            <h3 className="font-bold text-lg mb-2">Participants ({participants.length})</h3>
            <ul className="space-y-2">
                {participants.map(p => (
                    <li key={p.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>{p.name}</span>
                        <button onClick={() => kickStudent(p.id)} className="text-xs text-red-500 font-semibold hover:underline">
                            Kick out
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantsList;