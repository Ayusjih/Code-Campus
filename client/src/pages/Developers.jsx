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
    weeklyProgress: [] 
  });
  
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); 
  const [connecting, setConnecting] = useState(false); 

  const [showInput, setShowInput] = useState(null); 
  const [usernameInput, setUsernameInput] = useState("");

  const SUPPORTED_PLATFORMS = [
    { name: 'LeetCode', url: 'leetcode.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png', profileUrl: 'https://leetcode.com/' },
    { name: 'Codeforces', url: 'codeforces.com', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-code-forces-3628695-3029920.png', profileUrl: 'https://codeforces.com/profile/' },
    { name: 'CodeChef', url: 'codechef.com', logo: 'https://static-00.iconduck.com/assets.00/codechef-icon-380x512-r1v87w22.png', profileUrl: 'https://www.codechef.com/users/' },
    { name: 'HackerRank', url: 'hackerrank.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png', profileUrl: 'https://www.hackerrank.com/' },
    { name: 'GeeksForGeeks', url: 'geeksforgeeks.org', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg', profileUrl: 'https://auth.geeksforgeeks.org/user/' }
  ];

  // -- API FUNCTIONS --
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
      fetchDashboardData(user.uid);
    } catch (error) {
      console.error(error);
      alert(`Error connecting to ${platformName}. Please check the username.`);
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
        const res = await axios.post('/api/platforms/sync', { firebase_uid: user.uid });
        alert(`Sync Complete! Updated: ${res.data.updated.join(', ')}. \nRemaining syncs for today: ${res.data.remaining}`);
        fetchDashboardData(user.uid);
    } catch (error) {
        console.error(error);
        const errMsg = error.response?.data?.error || "Sync failed. Try again later.";
        alert(errMsg);
    } finally {
        setIsSyncing(false);
    }
  };

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

  const getPlatformData = (name) => platforms.find(p => p.platform_name === name);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-medium">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user.displayName ? user.displayName.split(' ')[0] : 'Coder'}! 👋
                </h1>
                <p className="text-gray-500 mt-1">Track your progress and analyze your performance.</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative group">
                  <button onClick={handleSync} disabled={isSyncing} className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all border shadow-sm ${isSyncing ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200'}`}>
                      <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {isSyncing ? 'Syncing...' : 'Sync Data'}
                  </button>
                  <div className="absolute -top-2 -right-2"><div className="relative"><div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center cursor-help group-hover:bg-amber-600 transition-colors"><span className="text-xs font-bold text-white">i</span></div><div className="absolute top-6 right-0 w-64 p-4 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"><div className="text-xs space-y-2"><div className="font-bold text-gray-900 flex items-center gap-1">Sync Limits</div><p className="text-gray-600">• 5 syncs/day to prevent API overuse</p><p className="text-gray-600">• Resets at midnight (UTC)</p></div><div className="absolute -top-1 right-3 w-2 h-2 bg-white border-t border-l border-gray-200 transform rotate-45"></div></div></div></div>
                </div>
                <button onClick={() => navigate('/edit-profile')} className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-blue-200 shadow-md"><span>Edit Profile</span></button>
                <button onClick={() => navigate('/profile')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-colors">View Full Profile</button>
            </div>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* LEFT CONTENT AREA */}
            <div className="lg:col-span-3 space-y-8">
                
                {/* STAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-6 -mt-6"></div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Problems</p>
                            <h2 className="text-4xl font-black text-gray-900 mt-2">{stats.totalSolved}</h2>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-full text-blue-600 absolute bottom-4 right-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-full -mr-6 -mt-6"></div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">College Rank</p>
                            <h2 className="text-4xl font-black text-gray-900 mt-2">#{stats.collegeRank}</h2>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-full text-yellow-600 absolute bottom-4 right-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full -mr-6 -mt-6"></div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Active Platforms</p>
                            <h2 className="text-4xl font-black text-gray-900 mt-2">{stats.activePlatforms}</h2>
                        </div>
                        <div className="bg-green-50 p-4 rounded-full text-green-600 absolute bottom-4 right-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg></div>
                    </div>
                </div>

                {/* GRAPHS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityGraph dataPoints={stats.weeklyProgress} />
                    <PlatformPieChart platforms={platforms} /> 
                </div>

                {/* PLATFORMS GRID */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Platforms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {SUPPORTED_PLATFORMS.map((plat) => {
                            const data = getPlatformData(plat.name);
                            const isConnected = !!data;
                            const isEditing = showInput === plat.name;
                            return (
                                <div key={plat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <img src={plat.logo} className="w-10 h-10 object-contain" alt={plat.name} />
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{plat.name}</h3>
                                                    <a href={`https://${plat.url}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-blue-500 transition-colors">{plat.url}</a>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{isConnected ? 'Active' : 'Inactive'}</span>
                                        </div>
                                        {isConnected ? (
                                            <div className="mt-6 space-y-3">
                                                <div className="flex justify-between text-sm p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <span className="text-gray-500 font-medium">Problems Solved</span>
                                                    <span className="font-black text-lg text-gray-900">{data.problems_solved}</span>
                                                </div>
                                                <div className="flex justify-between items-center px-1 border-t border-gray-100 pt-2">
                                                    <span className="text-xs text-gray-400">HANDLE</span>
                                                    <a href={`${plat.profileUrl}${data.platform_handle}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">@{data.platform_handle}</a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {isEditing ? (
                                                    <div className="mt-6">
                                                        <input type="text" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Username" autoFocus />
                                                        <div className="flex gap-2 mt-2">
                                                            <button onClick={() => handleConnect(plat.name)} disabled={connecting} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex-1">{connecting ? '...' : 'Save'}</button>
                                                            <button onClick={() => setShowInput(null)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setShowInput(plat.name)} className="w-full mt-6 py-3 border border-dashed border-gray-300 text-gray-500 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold text-sm">+ Connect Account</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER NOTES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-gray-100 p-4 rounded-xl"><h4 className="font-bold text-sm mb-1">Sync Strategy</h4><p className="text-xs text-gray-600">Sync daily after solving problems. Limit: 5 per day.</p></div>
                  <div className="bg-blue-50 p-4 rounded-xl"><h4 className="font-bold text-sm mb-1">Ranking Strategy</h4><p className="text-xs text-gray-600">LeetCode/Codeforces carry 1.2x weight.</p></div>
                </div>
            </div>

            {/* --- RIGHT SIDEBAR: PLATFORM GUIDE --- */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-blue-600">#</span> Platform Guide
                    </h3>
                    
                    <div className="space-y-6">
                        {/* LeetCode Note */}
                        <div className="pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-2 mb-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" className="w-4 h-4 grayscale" alt="" />
                                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-700">LeetCode</h4>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed italic">"Best for interview prep. Multiplier: 1.2x. Connect to track your Daily Challenges."</p>
                        </div>

                        {/* Codeforces Note */}
                        <div className="pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-2 mb-2">
                                <img src="https://cdn.iconscout.com/icon/free/png-256/free-code-forces-3628695-3029920.png" className="w-4 h-4 grayscale" alt="" />
                                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-700">Codeforces</h4>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed italic">"Competitive standard. Multiplier: 1.2x. Ratings updated live after official contests."</p>
                        </div>

                        {/* CodeChef Note */}
                        <div className="pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-2 mb-2">
                                <img src="https://static-00.iconduck.com/assets.00/codechef-icon-380x512-r1v87w22.png" className="w-4 h-4 grayscale" alt="" />
                                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-700">CodeChef</h4>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed italic">"Great for long challenges. Multiplier: 1.0x. Solved counts are synced via profile scraping."</p>
                        </div>

                        {/* HackerRank Note */}
                        <div className="pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-2 mb-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png" className="w-4 h-4 grayscale" alt="" />
                                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-700">HackerRank</h4>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed italic">"Perfect for language certifications. Multiplier: 0.8x. Score represents cumulative points."</p>
                        </div>

                        {/* GFG Note */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg" className="w-4 h-4 grayscale" alt="" />
                                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-700">GeeksForGeeks</h4>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed italic">"Ultimate DSA Resource. Multiplier: 0.5x. Points earned from practice problems contribute here."</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 font-medium">Need more help? Visit the Documentation or contact Ayush.</p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
