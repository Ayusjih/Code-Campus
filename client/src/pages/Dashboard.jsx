import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

// --- MOCK DATA & UTILS (To make this preview runnable without a backend) ---
const MOCK_PLATFORMS = [
  {
    platform_name: 'LeetCode',
    platform_handle: 'johndoe_lc',
    problems_solved: 342,
    rating: 1650
  },
  {
    platform_name: 'Codeforces',
    platform_handle: 'johndoe_cf',
    problems_solved: 128,
    rating: 1420
  }
];

const MOCK_STATS = {
  totalSolved: 470,
  collegeRank: 42,
  activePlatforms: 2,
  weeklyProgress: [12, 15, 8, 22, 18, 25, 30] // Last 7 days problem counts
};

// --- COMPONENT: ActivityGraph (Pure SVG Implementation) ---
const ActivityGraph = ({ dataPoints = [] }) => {
  const maxVal = Math.max(...dataPoints, 1);
  const height = 150;
  const width = 300;
  const points = dataPoints
    .map((val, index) => {
      const x = (index / (dataPoints.length - 1)) * width;
      const y = height - (val / maxVal) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="font-bold text-gray-800 mb-4">Weekly Activity</h3>
      <div className="flex-1 flex items-end justify-center relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-full overflow-visible">
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid Lines */}
          <line x1="0" y1={height} x2={width} y2={height} stroke="#e5e7eb" strokeWidth="1" />
          <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />

          {/* Area Fill */}
          <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#lineGradient)" />

          {/* The Line */}
          <polyline
            fill="none"
            stroke="#4F46E5"
            strokeWidth="3"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {dataPoints.map((val, index) => {
             const x = (index / (dataPoints.length - 1)) * width;
             const y = height - (val / maxVal) * height;
             return (
               <circle key={index} cx={x} cy={y} r="4" fill="#fff" stroke="#4F46E5" strokeWidth="2" className="hover:r-6 transition-all" />
             );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
};

// --- COMPONENT: PlatformPieChart (CSS Conic Gradient Implementation) ---
const PlatformPieChart = ({ platforms = [] }) => {
  // Calculate distribution
  const total = platforms.reduce((acc, curr) => acc + (curr.problems_solved || 0), 0);
  
  // Colors for segments
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  let currentAngle = 0;
  const segments = platforms.map((p, i) => {
    const value = p.problems_solved || 0;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const start = currentAngle;
    currentAngle += angle;
    return { ...p, percentage, color: colors[i % colors.length], start, angle };
  });

  // Create conic-gradient string
  const gradient = segments.length > 0 
    ? segments.map(s => `${s.color} 0 ${s.percentage}%`).join(', ') // Simplified for demo, ideally calculates exact stops
    : '#e5e7eb 0 100%'; 

  // Better implementation for gradient stops:
  let gradientStops = [];
  let currentPct = 0;
  segments.forEach(s => {
    gradientStops.push(`${s.color} ${currentPct}% ${currentPct + s.percentage}%`);
    currentPct += s.percentage;
  });
  const backgroundStyle = segments.length > 0 
    ? `conic-gradient(${gradientStops.join(', ')})` 
    : '#f3f4f6';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <h3 className="font-bold text-gray-800 mb-4">Platform Distribution</h3>
      <div className="flex items-center gap-8 h-full">
        {/* The Chart */}
        <div className="relative w-32 h-32 rounded-full flex-shrink-0" style={{ background: backgroundStyle }}>
           <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex items-center justify-center">
             <div className="text-center">
               <span className="block text-xs text-gray-400 font-bold">Total</span>
               <span className="block text-xl font-black text-gray-800">{total}</span>
             </div>
           </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {segments.length > 0 ? segments.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                <span className="text-gray-600 font-medium">{s.platform_name}</span>
              </div>
              <span className="font-bold text-gray-900">{Math.round(s.percentage)}%</span>
            </div>
          )) : (
            <p className="text-sm text-gray-400 italic">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
  // -- FIREBASE INIT (Mocked for Preview) --
  // Ideally, this config comes from your process.env or index.js
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // Initialize dummy firebase for the preview to work without crashing
    const firebaseConfig = { apiKey: "dummy", authDomain: "dummy", projectId: "dummy" };
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      setAuth(authInstance);
    } catch (e) {
      // App already initialized or simple error, ignore for preview
      if (getAuth()) setAuth(getAuth());
    }
  }, []);

  // -- STATE MANAGEMENT --
  const [user, setUser] = useState({ 
    uid: 'mock-uid', 
    displayName: 'Preview User', 
    email: 'user@example.com' 
  }); 
  const [platforms, setPlatforms] = useState([]);
  const [stats, setStats] = useState({ 
    totalSolved: 0, 
    collegeRank: 'N/A', 
    activePlatforms: 0, 
    weeklyProgress: [] 
  });
  
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showInput, setShowInput] = useState(null); 
  const [usernameInput, setUsernameInput] = useState("");

  // -- CONFIGURATION --
  const SUPPORTED_PLATFORMS = [
    { 
      name: 'LeetCode', 
      url: 'leetcode.com', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png',
      profileUrl: 'https://leetcode.com/' 
    },
    { 
      name: 'Codeforces', 
      url: 'codeforces.com', 
      logo: 'https://cdn.iconscout.com/icon/free/png-256/free-code-forces-3628695-3029920.png',
      profileUrl: 'https://codeforces.com/profile/' 
    },
    { 
      name: 'CodeChef', 
      url: 'codechef.com', 
      logo: 'https://static-00.iconduck.com/assets.00/codechef-icon-380x512-r1v87w22.png',
      profileUrl: 'https://www.codechef.com/users/' 
    },
    { 
      name: 'HackerRank', 
      url: 'hackerrank.com', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png',
      profileUrl: 'https://www.hackerrank.com/' 
    },
    { 
      name: 'GeeksForGeeks', 
      url: 'geeksforgeeks.org', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg',
      profileUrl: 'https://auth.geeksforgeeks.org/user/' 
    }
  ];

  // -- MOCK API FUNCTIONS (Replaces Axios for Preview) --
  const fetchDashboardData = async (uid) => {
    // Simulate network delay
    setTimeout(() => {
      setPlatforms(MOCK_PLATFORMS);
      setStats(MOCK_STATS);
      setLoading(false);
    }, 1000);
  };

  const handleConnect = async (platformName) => {
    if (!usernameInput) return;
    setConnecting(true);
    
    // Simulate API Call
    setTimeout(() => {
        const newPlatform = {
            platform_name: platformName,
            platform_handle: usernameInput,
            problems_solved: Math.floor(Math.random() * 50),
            rating: 1200
        };
        
        setPlatforms(prev => [...prev, newPlatform]);
        setStats(prev => ({...prev, activePlatforms: prev.activePlatforms + 1}));
        
        // Reset UI
        setConnecting(false);
        setShowInput(null);
        setUsernameInput("");
        // alert(`${platformName} Connected Successfully!`);
    }, 1500);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setTimeout(() => {
        setIsSyncing(false);
        // alert("Sync Complete! Data updated.");
    }, 2000);
  };

  // -- AUTH EFFECT --
  useEffect(() => {
    // In a real app, you would listen to firebase auth here.
    // For this preview, we just load mock data immediately.
    fetchDashboardData('mock-uid');
  }, []);

  const getPlatformData = (name) => platforms.find(p => p.platform_name === name);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-600 font-medium animate-pulse">Loading Dashboard...</span>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900">
      
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Welcome back, {user.displayName ? user.displayName.split(' ')[0] : 'Coder'}! 👋
                </h1>
                <p className="text-gray-500 mt-1 font-medium">Track your progress and analyze your performance.</p>
            </div>

            <div className="flex items-center gap-3">
                <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all border shadow-sm
                          ${isSyncing 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                              : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200'
                          }`}
                  >
                      <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {isSyncing ? 'Syncing...' : 'Sync Data'}
                  </button>

                <button 
                  className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-blue-200 shadow-md active:scale-95"
                >
                    <span>Edit Profile</span>
                </button>
            </div>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* === LEFT COLUMN (Main Stats & Platforms) === */}
            <div className="lg:col-span-3 space-y-8">
                
                {/* 1. Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Problems */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group cursor-default">
                         <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                         <div className="relative z-10">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Problems</p>
                            <h2 className="text-4xl font-black text-gray-900 mt-2">{stats.totalSolved}</h2>
                         </div>
                         <div className="relative z-10 bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:rotate-12 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                         </div>
                    </div>

                    {/* College Rank */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group cursor-default">
                         <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                         <div className="relative z-10">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">College Rank</p>
                            <h2 className="text-4xl font-black text-gray-900 mt-2">#{stats.collegeRank}</h2>
                         </div>
                         <div className="relative z-10 bg-yellow-100 p-3 rounded-xl text-yellow-600 group-hover:rotate-12 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                         </div>
                    </div>

                    {/* Active Platforms */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all relative overflow-hidden group cursor-default">
                         <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                         <div className="relative z-10">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Platforms</p>
                            <h2 className="text-4xl font-black text-gray-900 mt-2">{stats.activePlatforms}</h2>
                         </div>
                         <div className="relative z-10 bg-green-100 p-3 rounded-xl text-green-600 group-hover:rotate-12 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                         </div>
                    </div>
                </div>

                {/* 2. Graphs Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityGraph dataPoints={stats.weeklyProgress} />
                    <PlatformPieChart platforms={platforms} /> 
                </div>

                {/* 3. Platforms Grid */}
                <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        Your Platforms <span className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-sm shadow-blue-200">{platforms.length} Connected</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dynamic Card Generation */}
                        {SUPPORTED_PLATFORMS.map((plat) => {
                            const data = getPlatformData(plat.name);
                            const isConnected = !!data;
                            const isEditing = showInput === plat.name;

                            return (
                                <div key={plat.name} className={`bg-white p-6 rounded-2xl shadow-sm border transition-all relative overflow-hidden group ${isConnected ? 'border-gray-100 hover:shadow-md' : 'border-gray-200 border-dashed bg-gray-50'}`}>
                                    {isConnected && (
                                      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors z-0"></div>
                                    )}
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                                                   <img src={plat.logo} className="w-full h-full object-contain" alt={plat.name} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{plat.name}</h3>
                                                    <a href={`https://${plat.url}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-blue-500 transition-colors">{plat.url}</a>
                                                </div>
                                            </div>
                                            {isConnected ? (
                                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-green-200">Active</span>
                                            ) : (
                                                <span className="bg-gray-200 text-gray-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Inactive</span>
                                            )}
                                        </div>

                                        {isConnected ? (
                                            <div className="mt-6 space-y-3">
                                                <div className="flex justify-between text-sm p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <span className="text-gray-500 font-medium">Problems Solved</span>
                                                    <span className="font-black text-lg text-gray-900">{data.problems_solved}</span>
                                                </div>
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-xs text-gray-400 font-bold tracking-wider">RATING</span>
                                                    <span className="font-bold text-gray-700">{data.rating > 0 ? data.rating : 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center px-1 border-t border-gray-100 pt-3 mt-2">
                                                    <span className="text-xs text-gray-400 font-bold tracking-wider">HANDLE</span>
                                                    <a href={`${plat.profileUrl}${data.platform_handle}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">
                                                        @{data.platform_handle}
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {isEditing ? (
                                                    <div className="mt-6 animate-fadeIn">
                                                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Enter {plat.name} Username</label>
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="text" 
                                                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                                                                value={usernameInput}
                                                                onChange={(e) => setUsernameInput(e.target.value)}
                                                                placeholder="e.g. johndoe123"
                                                                autoFocus
                                                            />
                                                            <button 
                                                                onClick={() => handleConnect(plat.name)}
                                                                disabled={connecting}
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-bold transition-colors disabled:opacity-70 flex items-center shadow-lg shadow-blue-200"
                                                            >
                                                                {connecting ? (
                                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                                ) : 'Save'}
                                                            </button>
                                                        </div>
                                                        <button onClick={() => setShowInput(null)} className="text-xs text-red-400 mt-2 hover:text-red-600 font-medium">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setShowInput(plat.name)}
                                                        className="w-full mt-6 py-3 border border-dashed border-gray-300 text-gray-400 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold text-sm flex items-center justify-center gap-2"
                                                    >
                                                        <span>+</span> Connect Account
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* === RIGHT COLUMN (Sidebar / Info Hub) === */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Widget 1: Sync Rules */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">Sync Limitations</h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        To maintain stability, manual syncs are limited to <span className="font-bold text-amber-600">5 times per day</span>.
                    </p>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <p className="text-[10px] text-amber-800 font-bold">Resets daily at 12:00 AM</p>
                    </div>
                </div>

                {/* Widget 2: Scoring System */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">Score Weights (XP)</h3>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                            <span className="text-gray-500">LeetCode</span>
                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">× 1.2</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Codeforces</span>
                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">× 1.2</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                            <span className="text-gray-500">CodeChef</span>
                            <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">× 1.0</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                            <span className="text-gray-500">HackerRank</span>
                            <span className="font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">× 0.8</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">GeeksForGeeks</span>
                            <span className="font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">× 0.5</span>
                        </div>
                    </div>
                </div>

                {/* Widget 3: Strategy Tip */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <h3 className="font-bold text-sm">Rank Boost Strategy</h3>
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed relative z-10">
                        Want to climb the leaderboard faster? Focus on solving problems on high-weight platforms like <span className="font-bold text-white border-b border-indigo-300/50">Codeforces</span> and <span className="font-bold text-white border-b border-indigo-300/50">LeetCode</span>.
                    </p>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
