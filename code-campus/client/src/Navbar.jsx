import React from 'react';

const Navbar = ({ user, currentView, onViewChange, onLogout }) => {
    const avatarUrl = user ? `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff&size=128&bold=true` : '';

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 h-16">
            <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('home')}>
                    <div className="h-9 w-9 bg-red-800 text-white flex items-center justify-center font-bold text-xs rounded shadow-sm">ITM</div>
                    <div className="flex flex-col leading-none">
                        <h1 className="text-sm font-bold text-red-900 tracking-wide">ITM GOI</h1>
                        <span className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase">GWALIOR • MP</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <button onClick={() => onViewChange('home')} className={`hover:text-indigo-600 transition ${currentView === 'home' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : ''}`}>Home</button>
                    <button className="hover:text-indigo-600 transition">Contests</button>
                    <button onClick={() => onViewChange('dashboard')} className={`hover:text-indigo-600 transition ${currentView === 'dashboard' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : ''}`}>Dashboard</button>
                    <button onClick={() => onViewChange('leaderboard')} className={`hover:text-indigo-600 transition ${currentView === 'leaderboard' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : ''}`}>Leaderboard</button>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                            <div className="text-right hidden sm:block leading-tight">
                                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                                <button onClick={onLogout} className="text-[10px] font-bold text-red-500 hover:underline">LOGOUT</button>
                            </div>
                            <img src={avatarUrl} alt="Profile" className="h-9 w-9 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:ring-2 ring-indigo-100 transition" />
                        </div>
                    ) : (
                        <button onClick={() => onViewChange('login')} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-xs hover:bg-indigo-700 shadow-md transition transform hover:scale-105">Login</button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;