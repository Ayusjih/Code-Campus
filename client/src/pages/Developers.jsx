import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth'; 
import myImage from "../assets/my1.jpg";
const BACKEND_URL = "https://code-campus-v3.onrender.com";

// --- ICONS ---
const Icons = {
  Book: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Star: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Github: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
  Linkedin: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
};

const Developers = () => {
  const [devData, setDevData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Dynamic fetch using your specific database full_name
        const res = await axios.get(`${BACKEND_URL}/api/users/profile/Ayush Ojha`);
        if (res.data.success) {
          setDevData(res.data.user);
        }
      } catch (err) {
        console.error("Database connection error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  // Constants that don't need database storage
  const profileInfo = {
    name: devData?.full_name || "Ayush Ojha",
    role: "Full Stack Java Developer",
    branch: devData?.branch || "Information Technology",
    github: "Ayusjih",
    linkedin: "ayush-ojha-447048344"
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-16">
      <div className="text-center pt-12 pb-10 px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Meet the Developer</h1>
        <p className="text-base text-gray-500 max-w-2xl mx-auto">Aspiring IT professional focused on academic excellence and innovative problem-solving.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* --- HEADER CARD: Connected to avatar_url --- */}
        <div className="relative mb-10 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative shrink-0">
               <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-[6px] border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                  {/* Dynamic image from Neon database 'avatar_url' column */}
                  <img 
                    src={myImage}
                    alt="Developer"
                    className="w-40 h-40 rounded-full object-cover"
                  />
               </div>
            </div>

            <div className="flex-1 text-center md:text-left text-white">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">{profileInfo.name}</h2>
              <p className="text-indigo-100 font-medium text-lg md:text-xl mb-3">{profileInfo.branch}</p>
              <p className="text-white/80 text-sm md:text-base mb-8 font-light leading-relaxed">{profileInfo.role}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <a href={`https://github.com/${profileInfo.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-semibold border border-white/20 transition-all hover:-translate-y-1"><Icons.Github /> GitHub</a>
                  <a href={`https://linkedin.com/in/${profileInfo.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-semibold border border-white/20 transition-all hover:-translate-y-1"><Icons.Linkedin /> LinkedIn</a>
              </div>
            </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Icons.Book /></div><h3 className="font-bold text-xl text-gray-800">Education</h3></div>
            <div className="mb-6">
                <h4 className="font-bold text-lg text-gray-900">Institute of Technology Management, Gwalior</h4>
                <p className="text-gray-600 font-medium">B. Tech in Information Technology</p>
                <div className="mt-3 flex gap-3"><span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">2021 - 2025</span><span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold">CGPA: 7.9</span></div>
            </div>
            <div>
                <h4 className="font-bold text-lg text-gray-900">Miss Hill Higher Secondary School</h4>
                <p className="text-gray-600 font-medium">Class 12 (CBSE)</p>
                <div className="mt-3"><span className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full font-bold">Completed 2023 • 78%</span></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl"><Icons.Star /></div><h3 className="font-bold text-xl text-gray-800">Achievements</h3></div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-700 transition-colors"><span className="text-orange-400">⭐</span><span className="text-sm font-medium">Winner: Theme Defence in National Level Hack-Arena Hackathon</span></li>
              <li className="flex items-start gap-3 text-gray-700 transition-colors"><span className="text-orange-400">⭐</span><span className="text-sm font-medium">Rank 2: Cybersecurity Hackathon by Gwalior Police</span></li>
              <li className="flex items-start gap-3 text-gray-700 transition-colors"><span className="text-orange-400">⭐</span><span className="text-sm font-medium">Rank 2: IIC Code Competition, ITM Sithouli</span></li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Developers;
