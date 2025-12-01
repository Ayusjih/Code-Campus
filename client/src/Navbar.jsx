import React from 'react';
// Ensure this path is correct based on where you saved the logo
import cllgLogo from './assets/ITM-University-logo.png'; 

const NavbarNew = ({ user, currentView, onViewChange, onLogout }) => {
    
    // Avatar generator
    const avatarName = user ? user.name : 'User';
    const avatarUrl = `https://ui-avatars.com/api/?name=${avatarName}&background=4F46E5&color=fff&size=128&bold=true`;

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 h-20 transition-all duration-300">
            <div className="max-w-[1400px] mx-auto px-6 h-full grid grid-cols-12 items-center">
                
                {/* --- 1. LEFT: LOGO (Span 3 columns) --- */}
                <div className="col-span-3 flex items-center justify-start">
                    <img 
                        src={cllgLogo} 
                        alt="ITM University Logo"
                        className="h-14 w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => onViewChange('home')}
                    />
                </div>

                {/* --- 2. CENTER: NAV PILL (Span 6 columns - Strictly Centered) --- */}
                <div className="col-span-6 flex justify-center">
                    <div className="bg-gray-100 p-1 rounded-full flex items-center shadow-inner gap-1">
                        
                        {/* HOME BUTTON */}
                        <button 
                            onClick={() => onViewChange('home')}
                            className={`
                                px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
                                ${currentView === 'home' 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-indigo-600 hover:bg-white'
                                }
                            `}
                        >
                            Home
                        </button>

                        {/* NAV LINKS (Logged Out vs Logged In) */}
                        {!user ? (
                            <>
                                <button 
                                    onClick={() => onViewChange('login')} 
                                    className={`
                                        px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
                                        ${currentView === 'login' 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'text-gray-500 hover:text-indigo-600 hover:bg-white'
                                        }
                                    `}
                                >
                                    Login
                                </button>
                                <button 
                                    onClick={() => onViewChange('register')} 
                                    className={`
                                        px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
                                        ${currentView === 'register' 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'text-gray-500 hover:text-indigo-600 hover:bg-white'
                                        }
                                    `}
                                >
                                    Register
                                </button>
                            </>
                        ) : (
                            // LOGGED IN LINKS
                            ['contests', 'dashboard', 'leaderboard'].map(item => (
                                <button 
                                    key={item}
                                    onClick={() => onViewChange(item)}
                                    className={`
                                        hidden lg:inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
                                        ${currentView === item 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'text-gray-400 hover:text-indigo-600 hover:bg-white'
                                        }
                                    `}
                                >
                                    {item}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* --- 3. RIGHT: PROFILE & DEV OPTION (Span 3 columns - Right Aligned) --- */}
                <div className="col-span-3 flex items-center justify-end gap-4">
                    
                    {/* User Profile Info */}
                    {user && (
                        <div className="flex items-center gap-3 border-r border-gray-200 pr-4 mr-1">
                            <div className="text-right hidden xl:block">
                                <p className="text-xs font-bold text-gray-800 leading-none mb-1">{user.name}</p>
                                <button onClick={onLogout} className="text-[10px] font-bold text-red-500 hover:underline uppercase">Log Out</button>
                            </div>
                            <img src={avatarUrl} alt="Profile" className="h-9 w-9 rounded-full border-2 border-white shadow-sm" />
                        </div>
                    )}

                    {/* DEVELOPER OPTION - MOST RIGHT */}
                    <button 
                        onClick={() => onViewChange('developer')}
                        className={`
                            text-xs font-bold uppercase tracking-wider transition-colors duration-300 border border-transparent hover:border-indigo-100 px-3 py-1.5 rounded-lg whitespace-nowrap
                            ${currentView === 'developer' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600'}
                        `}
                    >
                        Developer
                    </button>
                </div>
            </div>

            {/* Mobile Menu Fallback Line */}
            <div className="md:hidden absolute bottom-0 left-0 w-full h-[1px] bg-gray-100"></div>
        </nav>
    );
};

export default NavbarNew;