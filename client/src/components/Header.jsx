// frontend/src/components/Header.jsx
import React from 'react';

const Header = () => {
    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <div className="bg-brand-purple-light text-brand-purple text-xs font-semibold px-3 py-1 rounded-full">
                Intellus Poll
            </div>
        </div>
    );
};

export default Header;