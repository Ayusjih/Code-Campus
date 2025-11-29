import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout, isReadOnly = false, onShowLeaderboard, onShowProfile }) => {
  const [rank, setRank] = useState('--');
  const [percentile, setPercentile] = useState('--');
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeGraph, setActiveGraph] = useState('weekly');
  
  const [formData, setFormData] = useState({
    leetcode_id: user.leetcode_id || '',
    codeforces_id: user.codeforces_id || '',
    codechef_id: user.codechef_id || '',
    hackerrank_id: user.hackerrank_id || ''
  });

  // --- ENHANCED CALCULATIONS ---
  const lcScore = (user.lc_easy * 10) + (user.lc_medium * 50) + (user.lc_hard * 100);
  const cfScore = user.cf_rating || 0;
  const ccScore = user.cc_rating || 0;
  const hrScore = (user.hackerrank_score || 0) * 0.5;
  const contestScore = user.college_contest_points || 0;
  const totalScore = lcScore + cfScore + ccScore + hrScore + contestScore;
  const platformsConnected = [user.leetcode_id, user.codeforces_id, user.codechef_id, user.hackerrank_id].filter(Boolean).length;

  // Problems solved from all platforms
  const lcTotal = (user.lc_easy || 0) + (user.lc_medium || 0) + (user.lc_hard || 0);
  const cfTotal = user.cf_solved || 0;
  const ccTotal = user.cc_solved || 0;
  const hrTotal = user.hr_solved || 0;

  const totalSolved = lcTotal + cfTotal + ccTotal + hrTotal;

  // Detailed breakdown for display
  const platformBreakdown = [
    { name: 'LeetCode', solved: lcTotal, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Codeforces', solved: cfTotal, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'CodeChef', solved: ccTotal, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'HackerRank', solved: hrTotal, color: 'text-green-600', bg: 'bg-green-100' }
  ];

  // Best Platform Logic
  const scores = [
    { name: 'LeetCode', score: lcScore, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⚡' },
    { name: 'Codeforces', score: cfScore, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📊' },
    { name: 'CodeChef', score: ccScore, color: 'text-orange-600', bg: 'bg-orange-50', icon: '👨‍🍳' },
    { name: 'HackerRank', score: hrScore, color: 'text-green-600', bg: 'bg-green-50', icon: 'H' }
  ];
  const bestPlatform = scores.reduce((prev, current) => (prev.score > current.score) ? prev : current, scores[0]);

  // Mock data for graphs
  const weeklyData = [12, 19, 8, 17, 22, 9, 14];
  const performanceData = [65, 78, 82, 75, 90, 85, 88, 92, 87, 95, 89, 93];
  const platformContributions = [
    { name: 'LeetCode', value: lcScore, color: '#FFA116', percentage: Math.round((lcScore / totalScore) * 100) || 0 },
    { name: 'Codeforces', value: cfScore, color: '#1F8ACB', percentage: Math.round((cfScore / totalScore) * 100) || 0 },
    { name: 'CodeChef', value: ccScore, color: '#7A7A7A', percentage: Math.round((ccScore / totalScore) * 100) || 0 },
    { name: 'HackerRank', value: hrScore, color: '#2EC866', percentage: Math.round((hrScore / totalScore) * 100) || 0 },
    { name: 'Contests', value: contestScore, color: '#8B5CF6', percentage: Math.round((contestScore / totalScore) * 100) || 0 }
  ].filter(item => item.value > 0);

  // --- DATA FETCHING ---
  useEffect(() => {
    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        const leaderboardData = data.leaderboard || data;
        const myIndex = leaderboardData.findIndex(u => 
            u.email && user.email && 
            u.email.trim().toLowerCase() === user.email.trim().toLowerCase()
        );
        if (myIndex !== -1) {
          const myRank = myIndex + 1;
          setRank(myRank);
          const totalStudents = leaderboardData.length;
          const topPercent = Math.ceil((myRank / totalStudents) * 100);
          setPercentile(topPercent);
        }
      })
      .catch(err => {
        console.error('Error fetching leaderboard:', err);
      });
  }, [user.email]);

  // --- HANDLERS ---
  const handleUpdateProfile = async () => {
    if (isReadOnly) return;
    try {
      const res = await fetch('http://localhost:5000/api/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...formData })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Profile Saved! Reloading...');
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('codecampus_user', JSON.stringify(updatedUser));
        window.location.reload(); 
      } else { 
        alert('Update Failed: ' + data.message); 
      }
    } catch (err) { 
      alert('Update Failed'); 
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch('http://localhost:5000/api/refresh-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Stats Synced! (${data.user.fetch_count}/5 used)`);
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('codecampus_user', JSON.stringify(updatedUser));
        window.location.reload();
      } else { 
        alert('⚠️ ' + data.message); 
      }
    } catch (err) { 
      alert('Server Error'); 
    } 
    finally { 
      setRefreshing(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('codecampus_user');
    localStorage.removeItem('codecampus_token');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/';
    }
  };

  const getLink = (platform, id) => {
      if (!id) return '#';
      if (platform === 'leetcode') return `https://leetcode.com/${id}`;
      if (platform === 'codeforces') return `https://codeforces.com/profile/${id}`;
      if (platform === 'codechef') return `https://www.codechef.com/users/${id}`;
      if (platform === 'hackerrank') return `https://www.hackerrank.com/${id}`;
      return '#';
  };

  // Graph Components
  const WeeklyProgressGraph = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Weekly Progress</h3>
        <span className="text-xs text-gray-500">Last 7 days</span>
      </div>
      <div className="h-48 flex items-end justify-between gap-2">
        {weeklyData.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
              style={{ height: `${(value / 25) * 100}%` }}
            />
            <span className="text-xs text-gray-500 mt-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
            <span className="text-xs font-bold text-gray-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const PerformanceGraph = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Performance Trend</h3>
        <span className="text-xs text-gray-500">Last 12 weeks</span>
      </div>
      <div className="h-48 relative">
        <div className="absolute inset-0 flex items-end justify-between">
          {performanceData.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-3/4 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500"
                style={{ height: `${(value / 100) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PieChart = () => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    
    let accumulatedPercent = 0;
    
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Score Distribution</h3>
          <span className="text-xs text-gray-500">By Platform</span>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="140" height="140" className="transform -rotate-90">
              {platformContributions.map((item, index) => {
                const strokeDasharray = circumference;
                const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                const currentAccumulated = accumulatedPercent;
                accumulatedPercent += item.percentage;
                
                return (
                  <circle
                    key={index}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={circumference - (currentAccumulated / 100) * circumference}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-800">{totalScore}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {platformContributions.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="font-bold text-gray-800">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 font-sans text-gray-800">
      
      {/* --- SETTINGS MODAL --- */}
      {!isReadOnly && showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm">Edit Platform IDs</h3>
                    <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white text-lg">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">LeetCode Username</label>
                        <input 
                            type="text" 
                            value={formData.leetcode_id} 
                            onChange={(e) => setFormData({...formData, leetcode_id: e.target.value})} 
                            className="w-full p-3 border border-gray-200 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Enter your LeetCode ID"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Codeforces Handle</label>
                        <input 
                            type="text" 
                            value={formData.codeforces_id} 
                            onChange={(e) => setFormData({...formData, codeforces_id: e.target.value})} 
                            className="w-full p-3 border border-gray-200 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Enter your Codeforces handle"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">CodeChef Username</label>
                        <input 
                            type="text" 
                            value={formData.codechef_id} 
                            onChange={(e) => setFormData({...formData, codechef_id: e.target.value})} 
                            className="w-full p-3 border border-gray-200 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Enter your CodeChef username"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">HackerRank ID</label>
                        <input 
                            type="text" 
                            value={formData.hackerrank_id} 
                            onChange={(e) => setFormData({...formData, hackerrank_id: e.target.value})} 
                            className="w-full p-3 border border-gray-200 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Enter your HackerRank ID"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setShowModal(false)} 
                        className="px-6 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdateProfile} 
                        className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- 1. ENHANCED HEADER BANNER --- */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12 translate-y-12"></div>

          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full border-4 border-white/80 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="text-left">
                <h1 className="text-3xl font-bold mb-2 tracking-tight">{user.name}</h1>
                <p className="text-blue-100 text-lg font-medium mb-3">
                  {user.branch} • Semester {user.semester} ({user.year} Year)
                </p>
                {user.role === 'alumni' && (
                  <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-white/30">
                    Alumni {user.passout_year}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
                <p className="text-blue-200 text-sm uppercase font-semibold tracking-wider mb-1">Roll Number</p>
                <p className="font-mono font-bold text-xl tracking-wider opacity-90 bg-white/10 px-4 py-2 rounded-lg">
                  {user.roll_number || 'Not set'}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={onShowProfile}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition border border-white/30 backdrop-blur-sm flex items-center gap-2"
                >
                  <span>👤</span>
                  Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition border border-white/30 backdrop-blur-sm flex items-center gap-2"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-sm font-medium border border-white/30 backdrop-blur-sm z-10">
              <span>Auto-synced</span>
              <button 
                onClick={handleRefresh} 
                disabled={refreshing || user.fetch_count >= 5} 
                className={`hover:text-blue-200 transition-transform ${refreshing ? 'animate-spin' : 'hover:scale-110'}`}
              >
                🔄
              </button>
            </div>
          )}
        </div>

        {/* --- 2. ENHANCED QUICK STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Platforms Used Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl group-hover:scale-110 transition-transform">
                🔄
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Platforms Used</p>
                <p className="text-2xl font-bold text-blue-900">{platformsConnected}</p>
              </div>
            </div>
          </div>

          {/* Problems Solved Card with Hover Tooltip */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group hover:border-green-200 relative">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-xl group-hover:scale-110 transition-transform">
                ✅
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Problems Solved</p>
                <p className="text-2xl font-bold text-green-900">{totalSolved}</p>
              </div>
            </div>
            
            {/* Hover Tooltip */}
            <div className="absolute inset-0 bg-green-50/90 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
              <div className="text-center p-4">
                <p className="text-sm font-bold text-green-800 mb-2">Breakdown by Platform</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {platformBreakdown.map((platform, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${platform.bg}`}></div>
                      <span className="font-semibold text-gray-700">{platform.name}:</span>
                      <span className="font-bold text-green-700">{platform.solved}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* College Rank Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group hover:border-yellow-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl group-hover:scale-110 transition-transform">
                🏆
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">College Rank</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-yellow-900">#{rank}</p>
                  <span className="text-xs font-semibold text-yellow-600">Top {percentile}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Score Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group hover:border-purple-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl group-hover:scale-110 transition-transform">
                📊
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Total Score</p>
                <p className="text-2xl font-bold text-purple-900">{parseInt(totalScore).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* --- 3. LEFT: PLATFORM LIST & GRAPHS --- */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Platform Cards Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Connected Platforms</h2>
                {!isReadOnly && (
                  <button 
                    onClick={() => setShowModal(true)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
                  >
                    <span>+</span>
                    Manage Platforms
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* LeetCode Card */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-25 border border-yellow-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LC" className="h-10 w-10 rounded-lg bg-white p-1 shadow-sm"/>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">LeetCode</h3>
                        <a href={getLink('leetcode', user.leetcode_id)} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
                          {user.leetcode_id || 'Not Connected'} 
                          <span className="text-xs">↗</span>
                        </a>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">SCORE</p>
                      <p className="text-2xl font-bold text-yellow-700">{parseInt(lcScore)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 bg-white/50 p-4 rounded-lg border border-yellow-100">
                    <div><p className="text-xs text-gray-500 mb-1">Easy</p><p className="font-bold text-green-600 text-sm">{user.lc_easy || 0}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Medium</p><p className="font-bold text-yellow-600 text-sm">{user.lc_medium || 0}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Hard</p><p className="font-bold text-red-600 text-sm">{user.lc_hard || 0}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Total</p><p className="font-bold text-gray-800 text-sm">{lcTotal}</p></div>
                  </div>
                </div>

                {/* Codeforces Card */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-lg shadow-sm">📊</div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Codeforces</h3>
                        <a href={getLink('codeforces', user.codeforces_id)} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
                          {user.codeforces_id || 'Not Connected'} 
                          <span className="text-xs">↗</span>
                        </a>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">SCORE</p>
                      <p className="text-2xl font-bold text-blue-700">{cfScore}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-white/50 p-4 rounded-lg border border-blue-100">
                    <div><p className="text-xs text-gray-500 mb-1">Rating</p><p className="font-bold text-gray-800 text-sm">{user.cf_rating || 'N/A'}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Solved</p><p className="font-bold text-gray-800 text-sm">{cfTotal}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Rank</p><p className="font-bold text-blue-600 text-sm">-</p></div>
                  </div>
                </div>

                {/* CodeChef Card */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-25 border border-orange-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-lg shadow-sm">👨‍🍳</div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">CodeChef</h3>
                        <a href={getLink('codechef', user.codechef_id)} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
                          {user.codechef_id || 'Not Connected'} 
                          <span className="text-xs">↗</span>
                        </a>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">SCORE</p>
                      <p className="text-2xl font-bold text-orange-700">{ccScore}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-white/50 p-4 rounded-lg border border-orange-100">
                    <div><p className="text-xs text-gray-500 mb-1">Rating</p><p className="font-bold text-gray-800 text-sm">{user.cc_rating || 'N/A'}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Stars</p><p className="font-bold text-yellow-600 text-sm">★</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Problems</p><p className="font-bold text-gray-800 text-sm">{ccTotal}</p></div>
                  </div>
                </div>

                {/* HackerRank Card */}
                <div className="bg-gradient-to-r from-green-50 to-green-25 border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-lg font-bold shadow-sm">H</div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">HackerRank</h3>
                        <a href={getLink('hackerrank', user.hackerrank_id)} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
                          {user.hackerrank_id || 'Not Connected'} 
                          <span className="text-xs">↗</span>
                        </a>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">SCORE</p>
                      <p className="text-2xl font-bold text-green-700">{hrScore}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-white/50 p-4 rounded-lg border border-green-100">
                    <div><p className="text-xs text-gray-500 mb-1">Points</p><p className="font-bold text-gray-800 text-sm">{user.hackerrank_score || 0}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Badges</p><p className="font-bold text-gray-800 text-sm">-</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Problems</p><p className="font-bold text-gray-800 text-sm">{hrTotal}</p></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphs Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Performance Analytics</h2>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                  {[
                    { key: 'weekly', label: 'Weekly Progress' },
                    { key: 'performance', label: 'Trend' },
                    { key: 'distribution', label: 'Distribution' }
                  ].map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setActiveGraph(type.key)}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
                        activeGraph === type.key
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[300px]">
                {activeGraph === 'weekly' && <WeeklyProgressGraph />}
                {activeGraph === 'performance' && <PerformanceGraph />}
                {activeGraph === 'distribution' && <PieChart />}
              </div>
            </div>
          </div>

          {/* --- 4. RIGHT: SIDEBAR --- */}
          <div className="space-y-6">
            
            {/* Best Platform Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Your Best Platform</h3>
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-xl ${bestPlatform.bg} ${bestPlatform.color} shadow-sm`}>
                  {bestPlatform.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">{bestPlatform.name}</p>
                  <p className="text-sm text-gray-600">Score: {parseInt(bestPlatform.score)}</p>
                  <p className="text-xs text-gray-500 mt-1">Highest Contributor</p>
                </div>
              </div>
            </div>

            {/* Refresh Info Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Sync Your Data</h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Pull latest stats from all connected platforms. Updates may take 5-10 minutes to reflect in rankings.
              </p>
              {!isReadOnly && (
                <button 
                  onClick={handleRefresh} 
                  disabled={refreshing || user.fetch_count >= 5}
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all ${
                    user.fetch_count >= 5 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-sm hover:shadow-md'
                  }`}
                >
                  {refreshing ? '🔄 Updating...' : '📡 Sync Now'}
                </button>
              )}
              <p className="text-xs text-gray-500 mt-3 text-center">
                Daily limit: <span className="font-bold text-gray-700">{5 - (user.fetch_count || 0)}/5</span> remaining
              </p>
            </div>
            
            {/* How Rank Calculated */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Scoring System</h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Your rank is calculated based on weighted performance across all platforms.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500">LeetCode Easy</span>
                  <span className="font-bold text-gray-800 bg-green-100 px-2 py-1 rounded">10 pts</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500">LeetCode Medium</span>
                  <span className="font-bold text-gray-800 bg-yellow-100 px-2 py-1 rounded">50 pts</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500">LeetCode Hard</span>
                  <span className="font-bold text-gray-800 bg-red-100 px-2 py-1 rounded">100 pts</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500">CF/CC Rating</span>
                  <span className="font-bold text-gray-800 bg-blue-100 px-2 py-1 rounded">100%</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500">HackerRank</span>
                  <span className="font-bold text-gray-800 bg-green-100 px-2 py-1 rounded">50%</span>
                </div>
              </div>
            </div>
            

            {/* Leaderboard CTA */}
            
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl text-white text-center shadow-lg">
              <h3 className="text-sm font-bold mb-2">See Where You Stand</h3>
              <p className="text-xs opacity-90 mb-4">Compare your progress with peers</p>
              <button 
                onClick={onShowLeaderboard}
                className="bg-white text-purple-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition shadow-sm"
              >
                View Leaderboard
              </button>
              
            </div>



        
    
<button 
  onClick={() => onNavigate('performance')}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
>
  View Performance Analytics
</button>  </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;