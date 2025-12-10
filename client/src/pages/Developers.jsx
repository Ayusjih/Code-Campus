import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { getAuth } from 'firebase/auth'; 

// --- ICONS ---
const Icons = {
  Book: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Star: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Github: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
  Linkedin: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
  Mail: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
};

const Developers = () => {
  const navigate = useNavigate();
  const [developerData, setDeveloperData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  
  // Credentials now start empty
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [loginError, setLoginError] = useState('');
  const [isDeveloper, setIsDeveloper] = useState(false);

  // --- API Base for local development login ---
  const API_BASE_URL = 'http://localhost:5000'; // Use local API base for developer auth

  useEffect(() => {
    // Check for existing token (Dev Access Status)
    const token = localStorage.getItem('developerToken');
    if (token) {
      setIsDeveloper(true);
    }
    
    setDeveloperData({
      education: [
        {
          institution: "Institute of Technology Management, Gwalior",
          degree: "B. Tech in Information Technology",
          duration: "2021 - 2025",
          cgpa: "7.9/10",
          enrollment: "ITM Student",
          department: "Information Technology"
        },
        {
          institution: "Miss Hill Higher Secondary School",
          degree: "Class 12 (CBSE)",
          duration: "Completed 2023",
          cgpa: "78%",
          enrollment: "School Student",
          department: "Science/Maths"
        }
      ],
      projects: [
        {
          title: "Google Cloud GenAI Intern",
          description: "Completed two virtual internships focusing on Generative AI technologies and Cloud frameworks.",
          category: "Internship",
          link: "https://www.linkedin.com/in/ayush-ojha-447048344/",
          dates: "Jan-Feb & Apr-May 2025"
        },
        {
          title: "Online Quiz System",
          description: "Built using Advanced Java (OOPS, JDBC, Servlet, Multithreading) for robust assessment.",
          category: "Full Stack Java",
          link: "https://github.com/Ayusjih",
          dates: "Academic Project"
        },
        {
          title: "Face Recognition Attendance",
          description: "Real-Time attendance system utilizing computer vision for automated tracking.",
          category: "AI/ML",
          link: "https://github.com/Ayusjih",
          dates: "System Design"
        },
        {
          title: "ShuvidaGo",
          description: "Web-based site for solving legal document problems in India.",
          category: "Web Development",
          link: "https://github.com/Ayusjih",
          dates: "Web Platform"
        },
        {
            title: "Safety Chrome Extension",
            description: "Browser extension designed for women, elder, and younger safety while web surfing.",
            category: "Cybersecurity",
            link: "https://github.com/Ayusjih",
            dates: "Extension"
        }
      ],
      achievements: [
        "Rank 1 (Winner): Theme Defence in 2nd National Level Hack-Arena Hackathon, GNIT Hyderabad (Team Leader)",
        "Rank 2: Cybersecurity Hackathon Organised by Police of Gwalior MP (Team Leader)",
        "Rank 2: IIC Code Competition in ITM college Sithouli Gwalior",
        "5th Runner Up: 2nd National Level Hack-Arena Hackathon GNIT Hyderabad",
        "Successfully captained high-performing team in LinguaSkill training program"
      ]
    });
    setLoading(false);
  }, []);

  // Add keyboard shortcut for Ctrl + Alt + D
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isCtrlPressed = event.ctrlKey || event.metaKey;
      const isAltPressed = event.altKey;
      const isDPressed = event.key === 'D' || event.key === 'd' || event.keyCode === 68;
      
      if (isCtrlPressed && isAltPressed && isDPressed) {
        event.preventDefault();
        setShowLogin(true);
        setLoginError('');
        setLoginCredentials({ email: '', password: '' });
        console.log('Developer login shortcut triggered!');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/developer/login`, loginCredentials);
      if (response.data.token) {
        localStorage.setItem('developerToken', response.data.token);
        setIsDeveloper(true);
        setShowLogin(false);
        setLoginError('');
        navigate('/developer-dashboard'); 
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed');
    }
  };

  const handleCancelLogin = () => {
    setShowLogin(false);
    setLoginError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading developer profile...</p>
        </div>
      </div>
    );
  }

  const safeData = developerData || { education: [], projects: [], achievements: [] };

  const mainDev = {
    name: "Ayush Ojha",
    role: "Full Stack Java Developer",
    branch: "Information Technology",
    email: "Ayushojha992005@gmail.com",
    github: "Ayusjih",
    linkedin: "ayush-ojha-447048344"
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-16">
      
      {/* 1. Page Title */}
      <div className="text-center pt-12 pb-10 px-4 relative">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Meet the Developer</h1>
        <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Aspiring IT professional with a strong academic foundation and a passion for technology, innovation, and problem-solving.
        </p>

        {/* Hidden/Developer Controls - Only visible AFTER login */}
        <div className="absolute top-4 right-4">
          {isDeveloper && (
            <div className="flex space-x-2">
              <button 
                onClick={() => window.location.href = '/developer-edit'} 
                className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold hover:bg-green-200 transition-colors"
              >
                Edit Mode
              </button>
              <button 
                onClick={() => { localStorage.removeItem('developerToken'); window.location.reload(); }} 
                className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Developer Login Modal - Triggered by Shortcut */}
        {showLogin && (
          <div className ="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Developer Access</h3>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">Secure Mode</span>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                  <input type="email" value={loginCredentials.email} onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                  <input type="password" value={loginCredentials.password} onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" required />
                </div>
                
                {loginError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium">{loginError}</div>}
                
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleCancelLogin} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Login Dashboard</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. HEADER CARD */}
        <div className="relative mb-10 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-blue-600 to-purple-700 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 transform hover:scale-[1.01] transition-transform duration-500">
            
            {/* Profile Picture */}
            <div className="relative shrink-0">
               <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-[6px] border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${mainDev.name}&background=111827&color=fff&size=256`} 
                    alt={mainDev.name} 
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>

            {/* Developer Details */}
            <div className="flex-1 text-center md:text-left text-white">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">{mainDev.name}</h2>
              <p className="text-blue-100 font-medium text-lg md:text-xl mb-3">{mainDev.branch}</p>
              <p className="text-white/80 text-sm md:text-base mb-8 max-w-lg mx-auto md:mx-0 font-light leading-relaxed">{mainDev.role}</p>
              
              {/* Social Pills */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <a href={`https://github.com/${mainDev.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-md border border-white/20 transition-all hover:-translate-y-1">
                    <Icons.Github /> {mainDev.github}
                  </a>
                  <a href={`https://linkedin.com/in/${mainDev.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-md border border-white/20 transition-all hover:-translate-y-1">
                    <Icons.Linkedin /> LinkedIn
                  </a>
                  <a href={`mailto:${mainDev.email}`} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-md border border-white/20 transition-all hover:-translate-y-1">
                    <Icons.Mail /> Email
                  </a>
              </div>
            </div>
        </div>

        {/* 3. Education & Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* Education Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
               <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Icons.Book /></div>
               <h3 className="font-bold text-xl text-gray-800">Education</h3>
            </div>
            {safeData.education.length > 0 ? safeData.education.map((edu, idx) => (
              <div key={idx} className="pl-2 mb-6 last:mb-0">
                 <h4 className="font-bold text-lg text-gray-900">{edu.institution}</h4>
                 <p className="text-gray-600 font-medium mt-1">{edu.degree}</p>
                 <div className="flex flex-wrap items-center gap-3 mt-4">
                   <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold border border-blue-100">📅 {edu.duration}</span>
                   <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold border border-green-100">Grade: {edu.cgpa}</span>
                 </div>
                 <div className="mt-4 text-sm text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p><span className="font-bold text-gray-700">Status:</span> {edu.enrollment}</p>
                    <p><span className="font-bold text-gray-700">Stream:</span> {edu.department}</p>
                 </div>
              </div>
            )) : <p className="text-gray-400 italic">No education details added.</p>}
          </div>

          {/* Achievements Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
               <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl"><Icons.Star /></div>
               <h3 className="font-bold text-xl text-gray-800">Key Achievements</h3>
            </div>
            <ul className="space-y-4">
              {safeData.achievements.length > 0 ? safeData.achievements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700 group p-2 hover:bg-orange-50/50 rounded-lg transition-colors">
                   <span className="text-orange-400 mt-1 text-sm group-hover:scale-125 transition-transform">⭐</span>
                   <span className="text-sm font-medium leading-relaxed">{item}</span>
                </li>
              )) : <p className="text-gray-400 italic">No achievements added.</p>}
            </ul>
          </div>

        </div>

        {/* 4. Internships / Projects Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8 px-2">
             <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
               <Icons.Briefcase />
             </div>
             <h3 className="font-bold text-2xl text-gray-800">Projects & Experience</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeData.projects.length > 0 ? safeData.projects.map((proj, idx) => (
              <div key={idx} className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100"></div>
                 
                 <div className="flex justify-between items-start mb-4 relative z-10">
                   <h4 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{proj.title}</h4>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                    {proj.dates && (
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md whitespace-nowrap border border-gray-200">
                         {proj.dates}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider border border-blue-100">{proj.category}</span>
                 </div>

                 <p className="text-sm text-gray-600 mb-6 flex-grow leading-relaxed relative z-10">{proj.description}</p>
                 
                 {proj.link && proj.link !== '#' && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 mt-auto border-t border-gray-50 pt-4 w-full group-hover:border-blue-50 transition-colors">
                      View Details <span className="ml-auto transform group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                 )}
              </div>
            )) : <p className="text-gray-400 italic col-span-full text-center py-10">No projects added.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Developers;