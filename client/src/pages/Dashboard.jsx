import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ActivityGraph from "../components/ActivityGraph";
import PlatformPieChart from "../components/PlatformPieChart";

const Dashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  
  // -- STATE MANAGEMENT --
  const [user, setUser] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [stats, setStats] = useState({ 
    totalSolved: 0, 
    collegeRank: 'N/A', 
    activePlatforms: 0, 
    weeklyProgress: [],
    totalScore: 0 // Added total score to stats
  });
  
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Input State for connecting new platforms inline
  const [showInput, setShowInput] = useState(null); 
  const [usernameInput, setUsernameInput] = useState("");

  // -- CONFIGURATION --
  const SUPPORTED_PLATFORMS = [
    { 
      name: 'LeetCode', 
      url: 'leetcode.com', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png',
      profileUrl: 'https://leetcode.com/',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-100'
    },
    { 
      name: 'Codeforces', 
      url: 'codeforces.com', 
      logo: 'https://cdn.iconscout.com/icon/free/png-256/free-code-forces-3628695-3029920.png',
      profileUrl: 'https://codeforces.com/profile/',
      color: 'text-blue-600 bg-blue-50 border-blue-100'
    },
    { 
      name: 'CodeChef', 
      url: 'codechef.com', 
      logo: 'https://static-00.iconduck.com/assets.00/codechef-icon-380x512-r1v87w22.png',
      profileUrl: 'https://www.codechef.com/users/',
      color: 'text-orange-600 bg-orange-50 border-orange-100'
    },
    { 
      name: 'HackerRank', 
      url: 'hackerrank.com', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png',
      profileUrl: 'https://www.hackerrank.com/',
      color: 'text-green-600 bg-green-50 border-green-100'
    },
    { 
      name: 'GeeksForGeeks', 
      url: 'geeksforgeeks.org', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg',
      profileUrl: 'https://auth.geeksforgeeks.org/user/',
      color: 'text-green-700 bg-green-100 border-green-200'
    }
  ];

  // -- API FUNCTIONS --

  // 1. Fetch All Data
  const fetchDashboardData = async (uid) => {
    try {
      const [platformRes, statsRes] = await Promise.all([
        axios.get(`/api/platforms/${uid}`),
        axios.get(`/api/platforms/stats/${uid}`)
      ]);

      setPlatforms(platformRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
      setLoading(false);
    }
  };

  // 2. Connect New Platform
  const handleConnect = async (platformName) => {
    if (!usernameInput) return;
    setConnecting(true);
    try {
      await axios.post('/api/platforms/connect', {
        firebase_uid: user.uid,
        platform: platformName,
        username: usernameInput
      });
      alert(`${platformName} Connected Successfully!`);
      setShowInput(null);
      setUsernameInput("");
      fetchDashboardData(user.uid); // Refresh UI
    } catch (error) {
      console.error(error);
      alert(`Error connecting to ${platformName}. Please check the username.`);
    } finally {
      setConnecting(false);
    }
  };

  // 3. Sync / Refresh Data (Rate Limited)
  const handleSync = async () => {
    setIsSyncing(true);
    try {
        const res = await axios.post('/api/platforms/sync', {
            firebase_uid: user.uid
        });
        
        alert(`Sync Complete! \nRemaining syncs for today: ${res.data.remaining}`);
        
        fetchDashboardData(user.uid); 
    } catch (error) {
        console.error(error);
        const errMsg = error.response?.data?.error || "Sync failed. Try again later.";
        alert(errMsg);
    } finally {
        setIsSyncing(false);
    }
  };

  // -- AUTH EFFECT --
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/");
      } else {
        setUser(currentUser);
        fetchDashboardData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [navigate, auth]);

  // Helper to find platform specific data
  const getPlatformData = (name) => platforms.find(p => p.platform_name === name);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.displayName ? user.displayName.split(' ')[0] : 'Coder'}</span>! 👋
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Here's what's happening with your code today.</p>
            </div>

            <div className="flex items-center gap-3">
                {/* Sync Button with Tooltip */}
                <div className="group relative">
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-xl transition-all border shadow-sm
                            ${isSyncing 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 hover:-translate-y-0.5'
                            }`}
                    >
                        <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isSyncing ? 'Syncing...' : 'Sync Data'}
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-lg text-center z-20">
                        Limited to 5 syncs per day to ensure stability.
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/edit-profile')}
                    className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5"
                >
                    <span>Edit Profile</span>
                </button>
                
                <button 
                    onClick={() => navigate('/profile')} 
                    className="bg-gray-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5"
                >
                    View Full Profile
                </button>
            </div>
        </div>

        {/* --- STAT CARDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Problems */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Solved</p>
                        <h2 className="text-4xl font-black text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
                            {stats.totalSolved}
                        </h2>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    </div>
                </div>
            </div>

            {/* Card 2: Rank */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">College Rank</p>
                        <h2 className="text-4xl font-black text-gray-900 mt-2 group-hover:text-yellow-600 transition-colors">
                            #{stats.collegeRank}
                        </h2>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                </div>
            </div>

            {/* Card 3: Platforms */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Active Platforms</p>
                        <h2 className="text-4xl font-black text-gray-900 mt-2 group-hover:text-green-600 transition-colors">
                            {stats.activePlatforms}
                        </h2>
                    </div>
                    <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    </div>
                </div>
            </div>

            {/* Card 4: Total Score (NEW) */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Total Score (XP)</p>
                        <h2 className="text-4xl font-black mt-2">
                            {stats.totalScore ? parseInt(stats.totalScore).toLocaleString() : '0'}
                        </h2>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl text-white backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                </div>
            </div>
        </div>

        {/* --- GRAPHS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-4">Weekly Activity</h3>
                 <ActivityGraph dataPoints={stats.weeklyProgress} />
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Platform Distribution</h3>
                <PlatformPieChart platforms={platforms} /> 
            </div>
        </div>

        {/* --- PLATFORMS GRID --- */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Your Platforms 
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {platforms.length} Connected
                </span>
            </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Dynamic Card Generation */}
            {SUPPORTED_PLATFORMS.map((plat) => {
                const data = getPlatformData(plat.name);
                const isConnected = !!data;
                const isEditing = showInput === plat.name;

                return (
                    <div key={plat.name} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all relative overflow-hidden group">
                        
                        {/* Decorative background blob */}
                        <div className={`absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 bg-gradient-to-br from-gray-50 to-${plat.color ? plat.color.split('-')[1] : 'blue'}-50`}></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <img src={plat.logo} className="w-8 h-8 object-contain" alt={plat.name} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{plat.name}</h3>
                                        <a href={`https://${plat.url}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-blue-500 transition-colors font-medium">{plat.url}</a>
                                    </div>
                                </div>
                                {isConnected ? (
                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Inactive</span>
                                )}
                            </div>

                            {isConnected ? (
                                <div className="mt-4 space-y-4">
                                    <div className="flex justify-between items-end p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Solved</div>
                                        <div className="font-black text-2xl text-gray-900">{data.problems_solved}</div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs text-gray-400 font-bold uppercase">Rating</span>
                                        <span className={`font-bold ${data.rating > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {data.rating > 0 ? data.rating : 'N/A'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center px-2 pt-3 border-t border-gray-100">
                                        <span className="text-xs text-gray-400 font-bold uppercase">Handle</span>
                                        <a href={`${plat.profileUrl}${data.platform_handle}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition-colors">
                                            @{data.platform_handle}
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {isEditing ? (
                                        <div className="mt-6 animate-fadeIn">
                                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Enter {plat.name} Username</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                                    value={usernameInput}
                                                    onChange={(e) => setUsernameInput(e.target.value)}
                                                    placeholder="e.g. user123"
                                                    autoFocus
                                                />
                                                <button 
                                                    onClick={() => handleConnect(plat.name)}
                                                    disabled={connecting}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 font-bold transition-all shadow-md disabled:opacity-70 flex items-center justify-center min-w-[70px]"
                                                >
                                                    {connecting ? (
                                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    ) : 'Save'}
                                                </button>
                                            </div>
                                            <button onClick={() => setShowInput(null)} className="text-xs text-red-500 mt-3 font-medium hover:text-red-700 ml-1">Cancel</button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setShowInput(plat.name)}
                                            className="w-full mt-6 py-4 border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-bold text-sm flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                            Connect Account
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
  );
};

export default Dashboard;
