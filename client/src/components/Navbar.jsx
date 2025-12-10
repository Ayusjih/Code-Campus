import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  // 1. Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // 2. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Navigation Links Config
  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Assessments', path: '/tasks' },
    { name: 'Contests', path: '/contests' }, // We need to create this
    { name: 'Teacher Panel', path: '/teacher-dashboard' },
    { name: 'Developers', path: '/developers' }, // We need to create this
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
         <div className="flex-shrink-0 flex items-center gap-2 group">
            <Link to="/" className="flex items-center">
              {/* REPLACE THE OLD LOGO CODE WITH THIS IMAGE TAG */}
              <img 
                src="/images/ITM.png" 
                alt="ITM University Logo" 
                className="h-12 w-auto object-contain" // Adjust h-12 to fit your navbar
              />
            </Link>
          </div>

          {/* DESKTOP MENU (Center) */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {/* RIGHT SIDE (Profile or Login Buttons) */}
          <div className="flex items-center gap-4">
            {user ? (
              // LOGGED IN STATE
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <span className="hidden md:block text-sm font-semibold text-gray-700">
                    {user.displayName ? user.displayName.split(' ')[0] : 'Student'}
                  </span>
                  <div className="h-9 w-9 rounded-full bg-gray-200 p-0.5 border-2 border-white shadow-md overflow-hidden hover:ring-2 hover:ring-blue-100 transition-all">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-fade-in-down origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-bold text-gray-900">{user.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link 
                      to="/edit-profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // LOGGED OUT STATE
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            {user && (
                <button 
                    className="md:hidden text-gray-600 focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
                </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-3 py-3 rounded-lg text-base font-medium mb-1 ${
                isActive(link.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-100 my-2 pt-2">
             <Link to="/edit-profile" className="block px-3 py-3 text-base font-medium text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>Edit Profile</Link>
             <button onClick={handleLogout} className="w-full text-left block px-3 py-3 text-base font-medium text-red-600">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;