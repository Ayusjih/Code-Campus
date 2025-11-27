import React, { useState, useEffect } from 'react';

// Import Platform Logos (Using URLs for simplicity, or import local assets)
const PLATFORMS = [
  { name: 'LeetCode', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png' },
  { name: 'CodeChef', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-codechef-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-2-pack-logos-icons-2944768.png?f=webp' },
  { name: 'Codeforces', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Codeforces_logo.svg' },
  { name: 'HackerRank', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png' },
  { name: 'AtCoder', logo: 'https://img.icons8.com/?size=100&id=69459&format=png&color=000000' } // Added for completeness
];

const Home = ({ onNavigate }) => {
  const [topCoders, setTopCoders] = useState([]);

  // Fetch Top 5 for Mini Leaderboard
  useEffect(() => {
    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => setTopCoders(data.slice(0, 5))) // Top 5
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* --- 1. HERO SECTION --- */}
      <div className="relative bg-indigo-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Track Your Competitive <br/> <span className="text-indigo-300">Programming Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            CodeCampus helps ITM students monitor their progress across multiple coding platforms 
            and improve their problem-solving skills with detailed analytics.
          </p>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-indigo-50 transition shadow-lg transform hover:scale-105"
          >
            Go to Dashboard
          </button>
        </div>
        
        {/* Curve Separator */}
        <div className="absolute bottom-0 left-0 right-0">
           <svg viewBox="0 0 1440 100" className="fill-white w-full h-12 md:h-24 block">
               <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
           </svg>
        </div>
      </div>

      {/* --- 2. WHY USE CODECAMPUS? --- */}
      <div className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Use CodeCampus?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">The official coding platform tracker for ITM Gwalior.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition text-center group">
                <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition">🔗</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Connect Multiple Platforms</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Link your profiles from LeetCode, CodeChef, Codeforces, and HackerRank.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition text-center group">
                <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition">📊</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Visualize Your Progress</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Access comprehensive statistics with intuitive charts and analytics.</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition text-center group">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition">📅</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Track Your Consistency</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Monitor your daily streak and build consistent coding habits.</p>
            </div>
        </div>
      </div>

      {/* --- 3. SUPPORTED PLATFORMS (NEW SECTION) --- */}
      <div className="bg-gray-50 py-16 px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Supported Platforms</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-sm">
            CodeCampus integrates with all major competitive programming platforms to give you a comprehensive view of your skills.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center max-w-4xl mx-auto opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
              {PLATFORMS.map((p, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                      <img src={p.logo} alt={p.name} className="h-12 md:h-16 object-contain group-hover:scale-110 transition" />
                      <span className="text-xs font-bold text-gray-400 group-hover:text-indigo-600">{p.name}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* --- 4. MITS CODING LEADERBOARD (Updated with Branch/Sem) --- */}
      <div className="bg-white py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">MITS Coding Leaderboard</h2>
            <p className="text-center text-gray-500 mb-12">Our top 5 performers across all coding platforms.</p>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-gray-50 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-4">Student</div>
                    <div className="col-span-2">Enrollment</div>
                    <div className="col-span-3">Branch & Sem</div>
                    <div className="col-span-2 text-right">Score</div>
                </div>

                {/* Table Body */}
                {topCoders.map((student, index) => (
                    <div key={index} className="grid grid-cols-12 items-center p-4 border-b border-gray-100 hover:bg-indigo-50 transition group">
                        
                        {/* Rank */}
                        <div className="col-span-1 text-center font-bold text-gray-700 text-lg">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        
                        {/* Student Name & Avatar */}
                        <div className="col-span-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-200">
                                {student.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-800 group-hover:text-indigo-600 transition">{student.name}</span>
                        </div>

                        {/* Enrollment (Dummy ID Logic for now) */}
                        <div className="col-span-2 text-sm text-gray-500 font-mono">
                            ITM{new Date().getFullYear()}{student.name.substring(0,3).toUpperCase()}
                        </div>

                        {/* Branch & Sem (NEW ADDITION) */}
                        <div className="col-span-3 text-sm">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold border border-gray-300">
                                {student.branch}
                            </span>
                            <span className="text-gray-500 text-xs ml-2">
                                {student.role === 'alumni' ? 'Graduated' : `Sem ${student.semester}, Year ${student.year}`}
                            </span>
                        </div>

                        {/* Score */}
                        <div className="col-span-2 text-right">
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold">
                                {parseInt(student.total_score)}
                            </span>
                        </div>
                    </div>
                ))}
                
                <div className="p-4 text-center bg-gray-50 border-t border-gray-200">
                    <button onClick={() => onNavigate('leaderboard')} className="text-indigo-600 font-bold text-sm hover:underline">
                        View Full Leaderboard →
                    </button>
                </div>
            </div>
          </div>
      </div>

      {/* --- 5. FOOTER STATS --- */}
      <div className="bg-slate-900 text-white py-16 px-4 relative overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
              <h2 className="text-2xl font-bold mb-2">Track Your Growth</h2>
              <p className="text-gray-400 mb-12 text-sm">CodeCampus provides detailed analytics to help you identify strengths and areas for improvement.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                      <p className="text-gray-400 text-xs font-bold uppercase mb-2">Problems Solved</p>
                      <p className="text-3xl font-extrabold text-white">86,500+</p>
                  </div>
                  <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                      <p className="text-gray-400 text-xs font-bold uppercase mb-2">Contests Participated</p>
                      <p className="text-3xl font-extrabold text-white">1,500+</p>
                  </div>
                  <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                      <p className="text-gray-400 text-xs font-bold uppercase mb-2">Highest Rating</p>
                      <p className="text-3xl font-extrabold text-white">2,124+</p>
                  </div>
                  <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                      <p className="text-gray-400 text-xs font-bold uppercase mb-2">Consistency Streak</p>
                      <p className="text-3xl font-extrabold text-white">324+ Days</p>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Home;