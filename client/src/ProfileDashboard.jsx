import React, { useState } from 'react';

const ProfileDashboard = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('view'); // 'view', 'platforms', 'academic'
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user.name || '',
    branch: user.branch || '',
    semester: user.semester || '',
    year: user.year || '',
    roll_number: user.roll_number || '',
    leetcode_id: user.leetcode_id || '',
    codeforces_id: user.codeforces_id || '',
    codechef_id: user.codechef_id || '',
    hackerrank_id: user.hackerrank_id || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...formData })
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Profile Updated!");
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('codecampus_user', JSON.stringify(updatedUser));
        window.location.reload();
      } else {
        alert("❌ Update Failed: " + data.message);
      }
    } catch (err) {
      alert("❌ Server Error");
    } finally {
      setLoading(false);
    }
  };

  // --- STATS CALCULATION FOR CARDS ---
  const lcSolved = (user.lc_easy || 0) + (user.lc_medium || 0) + (user.lc_hard || 0);
  const totalSolved = lcSolved + (user.cf_solved || 0) + (user.cc_solved || 0) + (user.hr_solved || 0);
  
  // Helper for progress bars (mock calculation)
  const getProgress = (solved, goal = 500) => Math.min((solved / goal) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
      
      {/* --- HEADER --- */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="text-gray-500 hover:text-blue-600 transition flex items-center gap-2 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
             </button>
             <h1 className="text-2xl font-bold text-gray-800 hidden md:block ml-4">My Profile</h1>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {[
                { id: 'view', label: 'View Profile' },
                { id: 'platforms', label: 'Edit Platforms' },
                { id: 'academic', label: 'Academic Info' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                        activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        
        {/* --- 1. VIEW PROFILE TAB --- */}
        {activeTab === 'view' && (
          <div className="space-y-8">
            
            {/* Identity Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row items-center gap-8">
               <div className="h-28 w-28 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-white ring-2 ring-gray-100">
                  {user.name.charAt(0)}
               </div>
               <div className="text-center md:text-left flex-1">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{user.name.toUpperCase()}</h2>
                  <p className="text-gray-500 font-mono text-sm tracking-wider mb-2">{user.roll_number || 'NO ROLL NUMBER'}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{user.branch}</span>
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">Sem {user.semester}, Year {user.year}</span>
                  </div>
               </div>
               <div className="text-right hidden md:block">
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Solved</p>
                   <p className="text-4xl font-extrabold text-gray-800">{totalSolved}</p>
               </div>
            </div>

            {/* Platform Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* LeetCode Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-yellow-500 text-white px-6 py-3 font-bold flex justify-between items-center">
                        <span>LeetCode</span>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" className="h-6 w-6 brightness-0 invert opacity-80" alt="LC"/>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-sm font-bold text-blue-600 mb-4 truncate">{user.leetcode_id || 'Not Connected'}</p>
                        
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{Math.round(getProgress(lcSolved))}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${getProgress(lcSolved)}%`}}></div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm text-gray-600"><span>Easy</span><span className="font-bold">{user.lc_easy || 0}</span></div>
                            <div className="flex justify-between text-sm text-gray-600"><span>Medium</span><span className="font-bold">{user.lc_medium || 0}</span></div>
                            <div className="flex justify-between text-sm text-gray-600"><span>Hard</span><span className="font-bold">{user.lc_hard || 0}</span></div>
                        </div>

                        <button className="mt-auto w-full py-2 bg-gray-50 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-100 transition border border-gray-200">
                            View Details
                        </button>
                    </div>
                </div>

                {/* CodeChef Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-red-500 text-white px-6 py-3 font-bold flex justify-between items-center">
                        <span>CodeChef</span>
                        <span className="text-white/80 text-xl">👨‍🍳</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-sm font-bold text-blue-600 mb-4 truncate">{user.codechef_id || 'Not Connected'}</p>
                        
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Rating Level</span>
                                <span>{user.cc_rating ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{width: `${user.cc_rating ? 60 : 0}%`}}></div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm text-gray-600"><span>Current Rating</span><span className="font-bold">{user.cc_rating || 'N/A'}</span></div>
                            <div className="flex justify-between text-sm text-gray-600"><span>Stars</span><span className="font-bold text-yellow-500">{user.cc_stars || 'N/A'} ★</span></div>
                            <div className="flex justify-between text-sm text-gray-600"><span>Solved</span><span className="font-bold">{user.cc_solved || 0}</span></div>
                        </div>

                        <button className="mt-auto w-full py-2 bg-gray-50 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-100 transition border border-gray-200">
                            View Details
                        </button>
                    </div>
                </div>

                {/* HackerRank Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-green-500 text-white px-6 py-3 font-bold flex justify-between items-center">
                        <span>HackerRank</span>
                        <span className="text-white/80 text-xl font-bold">H</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-sm font-bold text-blue-600 mb-4 truncate">{user.hackerrank_id || 'Not Connected'}</p>
                        
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Coding Score</span>
                                <span>{Math.min(user.hackerrank_score/100, 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: `${Math.min(user.hackerrank_score/10, 100)}%`}}></div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm text-gray-600"><span>Score</span><span className="font-bold">{user.hackerrank_score || 0}</span></div>
                            <div className="flex justify-between text-sm text-gray-600"><span>Badges</span><span className="font-bold text-gray-400">-</span></div>
                            <div className="flex justify-between text-sm text-gray-600"><span>Solved</span><span className="font-bold">{user.hr_solved || 0}</span></div>
                        </div>

                        <button className="mt-auto w-full py-2 bg-gray-50 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-100 transition border border-gray-200">
                            View Details
                        </button>
                    </div>
                </div>

            </div>
          </div>
        )}

        {/* --- 2. EDIT PLATFORMS TAB --- */}
        {activeTab === 'platforms' && (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Connect Your IDs</h3>
                    <div className="space-y-5">
                        {[
                            { label: 'LeetCode Username', name: 'leetcode_id', placeholder: 'e.g. ayush_ojha' },
                            { label: 'Codeforces Handle', name: 'codeforces_id', placeholder: 'e.g. ayush123' },
                            { label: 'CodeChef Username', name: 'codechef_id', placeholder: 'e.g. ayush_cc' },
                            { label: 'HackerRank ID', name: 'hackerrank_id', placeholder: 'e.g. ayush_hr' },
                        ].map((field) => (
                            <div key={field.name}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{field.label}</label>
                                <input
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Platforms'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- 3. ACADEMIC INFO TAB --- */}
        {activeTab === 'academic' && (
            <div className="max-w-3xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Update Academic Details</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Roll Number</label>
                                <input name="roll_number" value={formData.roll_number} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Branch</label>
                                <select name="branch" value={formData.branch} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option value="">Select</option>
                                    <option value="CSE">CSE</option>
                                    <option value="IT">IT</option>
                                    <option value="IOT">IOT</option>
                                    <option value="AIDS">AIDS</option>
                                    <option value="AIML">AIML</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Semester</label>
                                <select name="semester" value={formData.semester} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year</label>
                                <select name="year" value={formData.year} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={handleSave} disabled={loading} className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Update Details'}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ProfileDashboard;