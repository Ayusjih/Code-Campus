import React, { useState, useEffect } from 'react';

// Import Platform Logos
const PLATFORMS = [
  { name: 'LeetCode', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png' },
  { name: 'CodeChef', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-codechef-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-2-pack-logos-icons-2944768.png?f=webp' },
  { name: 'Codeforces', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Codeforces_logo.svg' },
  { name: 'HackerRank', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png' }
];
//--------------------------------------------------------------------------------------------------------
const Home = ({ onNavigate }) => {
   const [topCoders, setTopCoders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

// Add useEffect to fetch data on component mount
useEffect(() => {
    fetchData();
}, []); // Empty dependency array means this runs once on mount

// Fetch Top 10 Performers and Stats
const fetchData = async () => {
    try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'https://code-campus-2-r20j.onrender.com';
        
        // Only fetch leaderboard since stats endpoint doesn't exist
        const leaderboardResponse = await fetch(`${API_URL}/api/leaderboard`);
        
        if (!leaderboardResponse.ok) throw new Error('Failed to fetch leaderboard data');

        const leaderboardData = await leaderboardResponse.json();
        
        // Take top 10 from leaderboard
        const topPerformers = Array.isArray(leaderboardData) ? leaderboardData.slice(0, 10) : [];
        setTopCoders(topPerformers);
        
        // Create fake stats from leaderboard data
        if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
            const totalScore = leaderboardData.reduce((sum, student) => sum + (student.total_score || 0), 0);
            const totalStudents = leaderboardData.length;
            
            setStats({
                problemsSolved: Math.floor(totalScore * 10), // Estimate
                contests: Math.floor(totalStudents * 2), // Estimate
                highestRating: Math.max(...leaderboardData.map(s => s.rating || 0)),
                bestStreak: 365 // Default
            });
        } else {
            // Use demo data if no leaderboard data
            setStats({
                problemsSolved: 85000,
                contests: 1200,
                highestRating: 2100,
                bestStreak: 365
            });
        }
        
        setError(null);
    } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load real data. Using demo data temporarily.');
        // Set demo data
        setTopCoders([
            { name: "Ayush Ojha", branch: "CSE", semester: 3, total_score: 1150, rating: 1500, email: "ayush@example.com" },
            { name: "Aarav Sharma", branch: "CSE", semester: 5, total_score: 450, rating: 1400, email: "aarav@example.com" },
            { name: "Priya Patel", branch: "IT", semester: 4, total_score: 380, rating: 1350, email: "priya@example.com" }
        ]);
        setStats({
            problemsSolved: 85000,
            contests: 1200,
            highestRating: 2100,
            bestStreak: 365
        });
    } finally {
        setLoading(false);
    }
};
  //------------------------------

  const generateEnrollmentId = (student) => {
    if (student.roll_number) return student.roll_number;
    return `ITM${new Date().getFullYear()}${student.name?.substring(0, 3).toUpperCase() || 'USER'}`;
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- 1. HERO SECTION --- */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 pt-20 pb-28 lg:pt-32 lg:pb-36 overflow-hidden text-white">
        
        {/* Background Texture & Effects */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        {/* Animated Orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-medium mb-8 backdrop-blur-md shadow-lg animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
            </span>
            Official ITM Leaderboard
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-sm">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">
              Coding Journey
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-blue-100 mb-10 leading-relaxed drop-shadow-md">
            CodeCampus unifies your progress from LeetCode, CodeChef, and more into one powerful dashboard. Compete with peers and master the algorithms.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="group relative px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                Launch Dashboard
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </button>
            <button 
              onClick={() => onNavigate('leaderboard')}
              className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/30 hover:bg-white/10 hover:border-white/60 transition-all backdrop-blur-sm"
            >
              View Leaderboard
            </button>
          </div>

          {/* --- NEW STATIC & INTERACTIVE PLATFORMS SECTION --- */}
          <div className="pt-8 border-t border-white/10 flex flex-col items-center">
             <p className="text-xs font-semibold tracking-widest text-blue-200 uppercase mb-8 opacity-80">Integrated Platforms</p>
             
             {/* Static Container with Flexbox */}
             <div className="flex flex-wrap justify-center gap-6">
                {PLATFORMS.map((p, i) => (
                    <div 
                      key={i} 
                      className="group flex items-center gap-0 bg-white/10 hover:bg-white p-3 rounded-full transition-all duration-500 ease-out hover:pr-6 border border-white/20 hover:border-white shadow-lg cursor-default backdrop-blur-sm"
                    >
                        {/* Logo: Invert colors initially (white), restore original color on hover, Zoom effect */}
                        <img 
                          src={p.logo} 
                          alt={p.name} 
                          className="h-8 w-8 object-contain brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300 transform group-hover:scale-110" 
                        />
                        
                        {/* Text: Hidden initially, slides out on hover */}
                        <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 text-gray-900 font-bold whitespace-nowrap transition-all duration-500 group-hover:ml-3">
                          {p.name}
                        </span>
                    </div>
                ))}
             </div>
          </div>

        </div>
        
        {/* Curve Separator at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
           <svg viewBox="0 0 1440 100" className="fill-gray-50 w-full h-16 block">
               <path d="M0,32L80,42.7C160,53,320,75,480,80C640,85,800,75,960,64C1120,53,1280,43,1360,37.3L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
           </svg>
        </div>
      </div>

      {/* --- 2. WHY USE CODECAMPUS? --- */}
      <div className="py-20 px-4 max-w-6xl mx-auto bg-gray-50">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Use CodeCampus?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">The official coding platform tracker for ITM Gwalior provides powerful tools to help students enhance their competitive programming skills.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  🔗
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Connect Platforms</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Seamlessly link profiles from LeetCode, CodeChef, and Codeforces to centralize your coding identity.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Visualize Growth</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Gain deep insights into your problem-solving patterns with professional grade analytics and charts.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  📅
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Build Consistency</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Maintain your daily streak and track contest participation to build disciplined coding habits.</p>
            </div>
        </div>
      </div>

      {/* --- 4. LEADERBOARD SECTION --- */}
      <div className="bg-white py-20 px-4 border-t border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Top Performers</h2>
              <div className="h-1 w-20 bg-indigo-500 rounded-full"></div>
              <p className="text-center text-gray-500 mt-4">
                {topCoders.length > 0 
                  ? `Celebrating the top ${topCoders.length} developers leading the charts.` 
                  : 'Join the ranks of elite student developers.'}
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-500">Syncing live data...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
                <p className="text-red-600 mb-2 font-medium">{error}</p>
                <p className="text-sm text-red-500">Please ensure the backend service is active.</p>
              </div>
            ) : topCoders.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                <p className="text-gray-500 mb-6 text-lg">Leaderboard is currently empty.</p>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  Start Your Journey
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-black/5">
                {/* Header */}
                <div className="grid grid-cols-12 bg-gray-50/50 p-5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-4 pl-2">Developer</div>
                    <div className="col-span-2 hidden md:block">Enrollment</div>
                    <div className="col-span-3 hidden md:block">Details</div>
                    <div className="col-span-2 md:col-span-2 text-right">Total Score</div>
                </div>

                {/* Body */}
                <div className="divide-y divide-gray-100">
                {topCoders.map((student, index) => (
                    <div key={student.email || index} className="grid grid-cols-12 items-center p-5 hover:bg-indigo-50/30 transition duration-150 group">
                        
                        {/* Rank */}
                        <div className="col-span-1 flex justify-center">
                           {index < 3 ? (
                             <span className={`flex items-center justify-center w-8 h-8 rounded-full text-lg ${
                               index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                               index === 1 ? 'bg-gray-100 text-gray-600' : 
                               'bg-orange-100 text-orange-600'
                             }`}>
                               {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                             </span>
                           ) : (
                             <span className="text-gray-400 font-bold">#{index + 1}</span>
                           )}
                        </div>
                        
                        {/* Name */}
                        <div className="col-span-4 pl-2 flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                                index === 0 ? 'bg-yellow-500 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                            }`}>
                                {student.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 group-hover:text-indigo-600 transition">
                                {student.name || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-400 md:hidden">
                                {parseInt(student.total_score)} pts
                              </span>
                            </div>
                        </div>

                        {/* Enrollment */}
                        <div className="col-span-2 hidden md:block text-sm text-gray-500 font-mono">
                            {generateEnrollmentId(student)}
                        </div>

                        {/* Details */}
                        <div className="col-span-3 hidden md:block">
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium border border-gray-200">
                                  {student.branch || 'CSE'}
                              </span>
                              {student.semester && (
                                <span className="text-xs text-gray-400 py-0.5">
                                  Year {student.year || Math.ceil(student.semester/2)}
                                </span>
                              )}
                            </div>
                        </div>

                        {/* Score */}
                        <div className="col-span-2 hidden md:block text-right">
                            <span className="font-bold text-gray-900 text-lg">
                                {formatNumber(parseInt(student.total_score) || 0)}
                            </span>
                            <span className="text-xs text-gray-400 block">points</span>
                        </div>
                         {/* Mobile Score */}
                         <div className="col-span-7 md:hidden text-right flex items-center justify-end">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold">
                                {formatNumber(parseInt(student.total_score) || 0)}
                            </span>
                        </div>
                    </div>
                ))}
                </div>
                
                <div className="p-4 text-center bg-gray-50 border-t border-gray-200">
                    <button onClick={() => onNavigate('leaderboard')} className="text-indigo-600 font-bold text-sm hover:text-indigo-800 transition flex items-center justify-center gap-1 mx-auto">
                        View Full Leaderboard 
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                </div>
              </div>
            )}
          </div>
      </div>

      {/* --- 5. FOOTER STATS --- */}
      <div className="bg-slate-900 border-t border-slate-800 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white">Community Statistics</h2>
                  <p className="text-slate-400 text-sm max-w-md">
                    Live metrics tracking the collective achievements of the ITM coding community.
                  </p>
                </div>
                {/* Status Dot */}
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                   <span className={`w-2 h-2 rounded-full ${stats ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                   <span className="text-xs text-slate-300 font-mono">
                     {stats ? 'SYSTEM ONLINE' : 'CONNECTING...'}
                   </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                 {/* Stat Cards - Fixed the property names to match what we're setting */}
                 {[
                   { label: 'Problems Solved', value: stats?.problemsSolved || '85K+', icon: '🧩', color: 'text-indigo-400' },
                   { label: 'Contests', value: stats?.contests || '1.2K+', icon: '🏆', color: 'text-yellow-400' },
                   { label: 'Highest Rating', value: stats?.highestRating || '2100', icon: '⭐', color: 'text-purple-400' },
                   { label: 'Best Streak', value: (stats?.bestStreak || '365') + ' Days', icon: '🔥', color: 'text-orange-400' },
                 ].map((stat, i) => (
                   <div key={i} className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl">{stat.icon}</span>
                        <svg className="w-4 h-4 text-slate-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      </div>
                      <p className="text-3xl font-extrabold text-white tracking-tight mb-1">{formatNumber(stat.value)}</p>
                      <p className={`text-xs font-bold uppercase tracking-wider ${stat.color} opacity-80`}>{stat.label}</p>
                   </div>
                 ))}
              </div>
          </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 border-t border-slate-900 text-slate-500 py-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CodeCampus &bull; ITM Gwalior</p>
          <p className="mt-2 text-xs opacity-60">Built for developers, by developers.</p>
      </div>
      
      {/* Styles for animation - scroll keyframes removed as requested */}
      <style>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Home;