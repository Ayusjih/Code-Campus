import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Home = () => {
  const navigate = useNavigate();
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/platforms/leaderboard')
      .then(res => {
        const data = res.data.leaderboard || [];
        setTopPerformers(data.slice(0, 5));
        loading(false);
      })
      .catch(err => {
        // console.error("Error loading top performers:", err); // Suppress log for clean UI
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* --- HERO SECTION --- */}
      <header className="pt-24 pb-20 px-6 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest shadow-sm">
            🚀 The Ultimate Coding Tracker
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
            Track your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Coding Journey</span> <br className="hidden md:block"/> across all platforms.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Connect LeetCode, Codeforces, CodeChef, and more. Visualize your progress, compete with peers, and climb the college leaderboard.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-xl shadow-blue-200 hover:-translate-y-1"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                    onClick={() => navigate('/login')} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-xl shadow-blue-200 hover:-translate-y-1"
                >
                    Login Now
                </button>
                <button 
                    onClick={() => navigate('/register')} 
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-lg px-10 py-4 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                    Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- PLATFORMS STRIP --- */}
      <section className="py-10 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Supported Platforms</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode" className="h-8 md:h-10 object-contain" />
            <img src="https://cdn.iconscout.com/icon/free/png-256/free-code-forces-3628695-3029920.png" alt="Codeforces" className="h-8 md:h-10 object-contain" />
           <img src="/images/CodeChef.jpg" alt="CodeChef" className="h-8 md:h-10 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png" alt="HackerRank" className="h-8 md:h-10 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg" alt="GeeksForGeeks" className="h-7 md:h-9 object-contain" />
          </div>
        </div>
      </section>

      {/* --- COLLEGE DESCRIPTION SECTION --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative group">
                <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 opacity-10 group-hover:rotate-6 transition-transform duration-500"></div>
                <img 
                    src="/images/Raynold1.jpeg" // Using your ITM logo here, or upload a classroom photo to /public/images/classroom.jpg
                    alt="Coding Excellence" 
                    className="relative rounded-2xl shadow-2xl border border-gray-100 bg-white p-4 w-full h-auto object-cover transform transition-transform duration-500 group-hover:-translate-y-2" 
                />
            </div>

            {/* Text Side */}
            <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    ITM Coding Excellence
                </h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    ITM University, Gwalior has a rich tradition of encouraging competitive programming among its students. As a premier technical institution, ITM is dedicated to fostering a culture of algorithmic thinking and problem-solving excellence.
                </p>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    <strong>Code-Campus</strong> is an initiative to further strengthen this culture by providing students with tools to monitor their progress across multiple coding platforms, set goals, and track their improvement over time.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-3xl font-black text-blue-600 mb-1">500+</div>
                        <div className="text-sm font-semibold text-blue-800">Active Coders</div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="text-3xl font-black text-indigo-600 mb-1">10+</div>
                        <div className="text-sm font-semibold text-indigo-800">Weekly Contests</div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- LEADERBOARD PREVIEW --- */}
      <section className="py-24 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Performers</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">See who is leading the charts this week. Join the competition and improve your rank.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                    <tr>
                    <th className="py-5 px-6 font-bold text-gray-400">Rank</th>
                    <th className="py-5 px-6">Student</th>
                    <th className="py-5 px-6">Branch</th>
                    <th className="py-5 px-6">Semester & Year</th>
                    <th className="py-5 px-6 text-right text-blue-600">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                    <tr><td colSpan="6" className="py-12 text-center text-gray-400">Loading top coders...</td></tr>
                    ) : topPerformers.length === 0 ? (
                    <tr><td colSpan="6" className="py-12 text-center text-gray-400">No data yet. Be the first!</td></tr>
                    ) : (
                    topPerformers.map((student, index) => (
                        <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                        {/* RANK */}
                        <td className="py-5 px-6">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs
                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                index === 1 ? 'bg-gray-100 text-gray-600' : 
                                index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </div>
                        </td>

                        {/* STUDENT */}
                        <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm
                                ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}
                            `}>
                                {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                {student.name}
                            </span>
                            </div>
                        </td>

                        {/* BRANCH */}
                        <td className="py-5 px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                {student.branch || 'CSE'}
                            </span>
                        </td>

                        {/* SEMESTER */}
                        <td className="py-5 px-6 text-sm text-gray-500">
                            Semester {student.semester}, Year {student.year}
                        </td>

                        {/* SCORE */}
                        <td className="py-5 px-6 text-right font-black text-blue-600 text-lg">
                            {parseInt(student.total_score).toLocaleString()}
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            
            <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
              <button onClick={() => navigate('/leaderboard')} className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors">
                View Full Leaderboard →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-6">
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-10 md:p-16 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to Start Tracking?</h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10 text-lg">
                    Join now using your institute email and start monitoring your competitive programming journey across multiple platforms.
                </p>
                <button 
                    onClick={() => navigate(user ? '/dashboard' : '/register')}
                    className="relative z-10 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-900/50"
                >
                    {user ? 'Go to Dashboard' : 'Get Started Now'}
                </button>
            </div>
        </div>
      </section>

      {/* --- FOOTER (Updated to Match MITS Image) --- */}
      <footer className="bg-blue-50 py-12 border-t border-blue-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
            
            <div className="flex justify-center items-center gap-2 mb-4">
                <span className="text-blue-600 font-black text-xl tracking-tight">{'</>'}</span>
                <span className="font-bold text-gray-900 text-xl tracking-tight">Code-Campus</span>
            </div>

            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                A Competitive Programming Analytics Platform for tracking and improving your coding skills
            </p>

            <div className="flex justify-center gap-6 mb-8">
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><i className="fab fa-globe text-xl"></i></a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><i className="fab fa-linkedin text-xl"></i></a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><i className="fab fa-twitter text-xl"></i></a>
            </div>

            <div className="border-t border-gray-200 w-full max-w-xs mx-auto mb-8"></div>

            <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                <p>© 2025 Code-Campus | ITM University, Gwalior</p>
                <p className="mt-2 md:mt-0">Developed by <span className="font-bold text-gray-600">Ayush Ojha</span></p>
            </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;