import React, { useState, useEffect } from 'react';




const Dashboard = ({ user, onLogout, isReadOnly = false, onClose, onShowLeaderboard }) => {
  const [rank, setRank] = useState('--');
  const [percentile, setPercentile] = useState('--');
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [formData, setFormData] = useState({
    leetcode_id: user.leetcode_id || '',
    codeforces_id: user.codeforces_id || '',
    codechef_id: user.codechef_id || '',
    hackerrank_id: user.hackerrank_id || ''
  });

  // --- CALCULATIONS ---
  const lcScore = (user.lc_easy * 10) + (user.lc_medium * 50) + (user.lc_hard * 100);
  const cfScore = user.cf_rating || 0;
  const ccScore = user.cc_rating || 0;
  const hrScore = (user.hackerrank_score || 0) * 0.5;
  const contestScore = user.college_contest_points || 0;
  
  const totalScore = lcScore + cfScore + ccScore + hrScore + contestScore;
  const totalSolved = user.lc_easy + user.lc_medium + user.lc_hard;
  const platformsConnected = [user.leetcode_id, user.codeforces_id, user.codechef_id, user.hackerrank_id].filter(Boolean).length;

  // Best Platform Logic
  const scores = [
    { name: 'LeetCode', score: lcScore, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⚡' },
    { name: 'Codeforces', score: cfScore, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📊' },
    { name: 'CodeChef', score: ccScore, color: 'text-orange-600', bg: 'bg-orange-50', icon: '👨‍🍳' },
    { name: 'HackerRank', score: hrScore, color: 'text-green-600', bg: 'bg-green-50', icon: 'H' }
  ];
  const bestPlatform = scores.reduce((prev, current) => (prev.score > current.score) ? prev : current);

  // --- DATA FETCHING ---
  useEffect(() => {
    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        const myIndex = data.findIndex(u => 
            u.email && user.email && 
            u.email.trim().toLowerCase() === user.email.trim().toLowerCase()
        );
        if (myIndex !== -1) {
          const myRank = myIndex + 1;
          setRank(myRank);
          const totalStudents = data.length;
          const topPercent = Math.ceil((myRank / totalStudents) * 100);
          setPercentile(topPercent);
        }
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
      } else { alert('Update Failed: ' + data.message); }
    } catch (err) { alert('Update Failed'); }
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
      } else { alert('⚠️ ' + data.message); }
    } catch (err) { alert('Server Error'); } 
    finally { setRefreshing(false); }
  };

  const getLink = (platform, id) => {
      if (!id) return '#';
      if (platform === 'leetcode') return `https://leetcode.com/${id}`;
      if (platform === 'codeforces') return `https://codeforces.com/profile/${id}`;
      if (platform === 'codechef') return `https://www.codechef.com/users/${id}`;
      if (platform === 'hackerrank') return `https://www.hackerrank.com/${id}`;
      return '#';
  };

  // Avatar
  const avatarUrl = `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff&size=128&bold=true`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
     
      {/* --- SETTINGS MODAL --- */}
      {!isReadOnly && showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Edit Profile IDs</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">LeetCode</label><input type="text" value={formData.leetcode_id} onChange={(e) => setFormData({...formData, leetcode_id: e.target.value})} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Codeforces</label><input type="text" value={formData.codeforces_id} onChange={(e) => setFormData({...formData, codeforces_id: e.target.value})} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">CodeChef</label><input type="text" value={formData.codechef_id} onChange={(e) => setFormData({...formData, codechef_id: e.target.value})} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">HackerRank</label><input type="text" value={formData.hackerrank_id} onChange={(e) => setFormData({...formData, hackerrank_id: e.target.value})} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                    <button onClick={handleUpdateProfile} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Details</button>
                </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- 1. BLUE HEADER BANNER --- */}
        <div className="bg-blue-600 rounded-t-xl p-6 text-white flex flex-col md:flex-row items-center md:items-end gap-6 shadow-sm relative overflow-hidden">
             {/* Pattern Overlay */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

             {!isReadOnly && (
                 <div className="absolute top-4 right-4 flex items-center gap-2 bg-blue-700/50 px-3 py-1 rounded text-xs font-medium border border-blue-400/30 backdrop-blur-sm z-10">
                    <span>Data updated just now</span>
                    <button onClick={handleRefresh} disabled={refreshing || user.fetch_count >= 5} className={`hover:text-blue-200 ${refreshing ? 'animate-spin' : ''}`}>
                        🔄
                    </button>
                 </div>
             )}

            <div className="h-20 w-20 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center text-3xl font-bold shadow-sm z-10">
                {user.name.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left mb-1 z-10">
                <h1 className="text-2xl font-bold uppercase tracking-wide">{user.name}</h1>
                <p className="text-blue-100 text-sm font-medium">{user.branch} • Semester {user.semester} ({user.year} Year)</p>
                {user.role === 'alumni' && <span className="inline-block mt-2 bg-white text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Alumni {user.passout_year}</span>}
            </div>
            <div className="hidden md:block text-right z-10">
                <p className="text-blue-200 text-xs uppercase font-bold">Enrollment</p>
                <p className="font-mono font-bold text-lg tracking-wider opacity-90">ITM{new Date().getFullYear()}{user.id.slice(0,4).toUpperCase()}</p>
            </div>
        </div>

        {/* --- 2. QUICK STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-b-xl shadow-sm border border-t-0 border-gray-200 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4 border border-blue-100">
                <div className="h-10 w-10 bg-blue-200 text-blue-700 rounded flex items-center justify-center text-xl">📱</div>
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Platforms Used</p>
                    <p className="text-xl font-bold text-blue-900">{platformsConnected}</p>
                </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex items-center gap-4 border border-green-100">
                <div className="h-10 w-10 bg-green-200 text-green-700 rounded flex items-center justify-center text-xl">✅</div>
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Problems Solved</p>
                    <p className="text-xl font-bold text-green-900">{totalSolved}</p>
                </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-4 border border-yellow-100">
                <div className="h-10 w-10 bg-yellow-200 text-yellow-700 rounded flex items-center justify-center text-xl">🏆</div>
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">College Rank</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-yellow-900">#{rank}</p>
                        <span className="text-xs text-yellow-600 font-semibold">Top {percentile}%</span>
                    </div>
                </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg flex items-center gap-4 border border-purple-100">
                <div className="h-10 w-10 bg-purple-200 text-purple-700 rounded flex items-center justify-center text-xl">📊</div>
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Score</p>
                    <p className="text-xl font-bold text-purple-900">{parseInt(totalScore)}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* --- 3. LEFT: PLATFORM LIST --- */}
            <div className="lg:col-span-3 space-y-6">
                <div className="flex justify-between items-end">
                    <h2 className="text-lg font-bold text-gray-800">Your Platforms</h2>
                    {!isReadOnly && <button onClick={() => setShowModal(true)} className="text-xs text-blue-600 hover:underline font-medium">+ Add / Edit</button>}
                </div>

                {/* LeetCode Row */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LC" className="h-8 w-8"/>
                            <div>
                                <h3 className="font-bold text-gray-900">LeetCode</h3>
                                <a href={getLink('leetcode', user.leetcode_id)} target="_blank" className="text-xs text-gray-500 hover:text-blue-600">{user.leetcode_id || 'Not Connected'} ↗</a>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase">CONTRIBUTION</p>
                            <p className="text-xl font-bold text-gray-900">{parseInt(lcScore)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                        <div><p className="text-xs text-gray-500">Problems</p><p className="font-bold text-gray-800">{totalSolved}</p></div>
                        <div><p className="text-xs text-gray-500">Easy / Med / Hard</p><p className="font-bold text-gray-800 text-xs">{user.lc_easy} / {user.lc_medium} / {user.lc_hard}</p></div>
                        <div><p className="text-xs text-gray-500">Status</p><p className="font-bold text-green-600 text-xs">Active</p></div>
                    </div>
                </div>

                {/* Codeforces Row */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📊</span>
                            <div>
                                <h3 className="font-bold text-gray-900">Codeforces</h3>
                                <a href={getLink('codeforces', user.codeforces_id)} target="_blank" className="text-xs text-gray-500 hover:text-blue-600">{user.codeforces_id || 'Not Connected'} ↗</a>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase">CONTRIBUTION</p>
                            <p className="text-xl font-bold text-gray-900">{cfScore}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                        <div><p className="text-xs text-gray-500">Rating</p><p className="font-bold text-gray-800">{user.cf_rating || 'N/A'}</p></div>
                        <div><p className="text-xs text-gray-500">Max Rating</p><p className="font-bold text-gray-800">-</p></div>
                        <div><p className="text-xs text-gray-500">Rank</p><p className="font-bold text-blue-600 text-xs">-</p></div>
                    </div>
                </div>

                {/* CodeChef Row */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">👨‍🍳</span>
                            <div>
                                <h3 className="font-bold text-gray-900">CodeChef</h3>
                                <a href={getLink('codechef', user.codechef_id)} target="_blank" className="text-xs text-gray-500 hover:text-blue-600">{user.codechef_id || 'Not Connected'} ↗</a>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase">CONTRIBUTION</p>
                            <p className="text-xl font-bold text-gray-900">{ccScore}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                        <div><p className="text-xs text-gray-500">Current Rating</p><p className="font-bold text-gray-800">{user.cc_rating !== null ? user.cc_rating : 'N/A'}</p></div>
                        <div><p className="text-xs text-gray-500">Stars</p><p className="font-bold text-gray-800">★</p></div>
                        <div><p className="text-xs text-gray-500">Division</p><p className="font-bold text-gray-600 text-xs">-</p></div>
                    </div>
                </div>

                 {/* HackerRank Row */}
                 <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">H</span>
                            <div>
                                <h3 className="font-bold text-gray-900">HackerRank</h3>
                                <a href={getLink('hackerrank', user.hackerrank_id)} target="_blank" className="text-xs text-gray-500 hover:text-blue-600">{user.hackerrank_id || 'Not Connected'} ↗</a>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase">CONTRIBUTION</p>
                            <p className="text-xl font-bold text-gray-900">{hrScore}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                        <div><p className="text-xs text-gray-500">Points</p><p className="font-bold text-gray-800">{user.hackerrank_score || 0}</p></div>
                        <div><p className="text-xs text-gray-500">Badges</p><p className="font-bold text-gray-800">-</p></div>
                        <div><p className="text-xs text-gray-500">Status</p><p className="font-bold text-green-600 text-xs">{user.hackerrank_id ? 'Linked' : 'Pending'}</p></div>
                    </div>
                </div>

            </div>

            {/* --- 4. RIGHT: SIDEBAR --- */}
            <div className="space-y-6">
                
                {/* Best Platform Card */}
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                    <h3 className="text-xs font-bold text-blue-400 uppercase mb-2">Your Best Platform</h3>
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg ${bestPlatform.bg} ${bestPlatform.color}`}>
                           {bestPlatform.icon}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-800">{bestPlatform.name}</p>
                            <p className="text-xs text-gray-500">Highest Contribution</p>
                        </div>
                    </div>
                </div>

                {/* Refresh Info */}
                <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">Refresh Your Coding Data</h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        Pull the latest stats from all your connected platforms. It might take up to 10 minutes to update your latest performance in the Leaderboard.
                    </p>
                    {!isReadOnly && (
                        <button 
                            onClick={handleRefresh} 
                            disabled={refreshing || user.fetch_count >= 5}
                            className={`w-full py-2 rounded-lg text-xs font-bold text-white transition ${user.fetch_count >= 5 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {refreshing ? 'Updating...' : 'Update My Data'}
                        </button>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2 text-center">
                        Updates remaining today: <span className="font-bold text-gray-600">{5 - user.fetch_count} of 5</span>
                    </p>
                </div>
                
                {/* How Rank Calculated */}
                <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">How Rank is Calculated</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Your institute rank is based on your <b>Total Impact Score</b>. This score is derived by applying platform-specific weights to your performance on each platform.
                    </p>
                    <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs"><span className="text-gray-500">LeetCode Hard</span><span className="font-bold text-gray-800">100 pts</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">LeetCode Medium</span><span className="font-bold text-gray-800">50 pts</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">CF / CC Rating</span><span className="font-bold text-gray-800">100%</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">HackerRank</span><span className="font-bold text-gray-800">50%</span></div>
                    </div>
                </div>

            </div>
</div>
    </div>
        </div>
    
  );
};

export default Dashboard;