import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime }) => {
    const [time, setTime] = useState(initialTime);

    useEffect(() => {
        setTime(initialTime);
        const interval = setInterval(() => {
            setTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [initialTime]);

    // The icon is removed from here, as it's already in StudentView.jsx
    return (
        <span>00:{time.toString().padStart(2, '0')}</span>
    );
};

export default Timer;