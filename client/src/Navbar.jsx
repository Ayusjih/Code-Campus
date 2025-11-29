import React from 'react';

const NavbarNew = ({ user, currentView, onViewChange, onLogout }) => {
    // Generate navigation items based on user status
    // FIX: Include 'developer' in the core array logic
    const baseNavItems = ['home', 'contests', 'dashboard', 'leaderboard', 'developer'];
    
    // Filter nav items: only show auth-protected pages if user exists
    const navItems = user 
        ? baseNavItems 
        : ['home', 'login', 'register']; // Show only basic pages if logged out
    
    // Fallback avatar URL using user's name or initial 'CC'
    const avatarName = user ? user.name : 'CC';
    const avatarUrl = `https://ui-avatars.com/api/?name=${avatarName}&background=4F46E5&color=fff&size=128&bold=true`;

    return (
        // FIX: Navbar uses lighter shadow on white background
        <nav className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-100 h-16">
            <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
                
                {/* Logo and Branding (FIX: Added IMG tag with full logo URL) */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('home')}>
                    <img 
                        src="https://placehold.co/40x40/B8233D/FFFFFF?text=ITM" // Placeholder for the complex logo image
                        alt="ITM GOI Logo"
                        className="h-10 w-10 object-contain"
                    />
                    <div className="flex flex-col leading-none">
                        <h1 className="text-sm font-bold text-gray-900 tracking-wide">ITM GOI</h1>
                        <span className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase">GWALIOR • MP</span>
                    </div>
                </div>

                {/* Navigation Links (Dynamic) */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    {navItems.map(item => (
                        <button 
                            key={item} 
                            onClick={() => onViewChange(item)} 
                            className={`hover:text-indigo-600 transition uppercase tracking-wide ${
                                // FIX: Use indigo theme for active state
                                currentView === item 
                                    ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' 
                                    : ''
                            }`}
                        >
                            {/* Display "Developer" correctly */}
                            {item === 'developer' ? 'DEVELOPER' : item.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* User/Login Section */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                            <div className="text-right hidden sm:block leading-tight">
                                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                                {/* FIX: Logout button uses indigo theme color */}
                                <button onClick={onLogout} className="text-[10px] font-bold text-indigo-500 hover:underline">LOGOUT</button>
                            </div>
                            <img src={avatarUrl} alt="Profile" className="h-9 w-9 rounded-full border-2 border-indigo-200 shadow-sm cursor-pointer hover:ring-2 ring-indigo-300 transition" />
                        </div>
                    ) : (
                        // FIX: Login button uses indigo primary color
                        <button onClick={() => onViewChange('login')} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-xs hover:bg-indigo-700 shadow-md transition transform hover:scale-105">LOGIN</button>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Menu (if needed in future) */}
            <div className="md:hidden bg-white border-t border-gray-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item}
                            onClick={() => onViewChange(item)}
                            className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                                currentView === item
                                    ? 'text-indigo-800 bg-indigo-50'
                                    : 'text-gray-600 hover:text-indigo-700 hover:bg-gray-50'
                            }`}
                        >
                            {item.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default NavbarNew;