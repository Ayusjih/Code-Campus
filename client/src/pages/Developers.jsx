import React, { useEffect, useState } from "react";
import axios from "axios";
import myImage from "../assets/my1.jpg";
import { Github, Linkedin, Mail, MapPin, Terminal, Award, BookOpen } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://codecampusbacnend.onrender.com');

const Developers = () => {
  const [devData, setDevData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/users/profile/Ayush Ojha`
        );
        if (res.data?.success) {
          setDevData(res.data.user);
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-mono">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-4 h-4 bg-white rounded-none"></div>
          <span className="tracking-widest uppercase">Initializing System...</span>
        </div>
      </div>
    );
  }

  /* 🔒 SINGLE SOURCE OF TRUTH FOR IMAGE */
  const avatarSrc =
    devData?.avatar_url && devData.avatar_url.trim() !== ""
      ? devData.avatar_url
      : myImage;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black font-sans pb-20">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-50">
        <div className="text-2xl font-bold tracking-tighter italic" style={{ fontFamily: 'var(--font-signature, cursive)' }}>
          Ayush Ojha.
        </div>
        <nav className="hidden md:flex gap-8 font-mono text-xs uppercase tracking-widest text-gray-400">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#skills" className="hover:text-white transition-colors">Skills</a>
          <a href="#education" className="hover:text-white transition-colors">Education</a>
          <a href="#achievements" className="hover:text-white transition-colors">Achievements</a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-16 md:mt-24 space-y-24">

        {/* ================= HERO SECTION ================= */}
        <section className="border border-white/10 bg-[#111] relative group" id="about">
          {/* Top decorative stripe */}
          <div className="h-1 w-full bg-white"></div>

          <div className="p-8 md:p-14 flex flex-col-reverse md:flex-row gap-12 items-center justify-between">
            <div className="flex-1">
              <div className="font-mono text-xs text-white/50 mb-6 border border-white/10 inline-block px-3 py-1 bg-black">
                <span className="inline-block w-2 h-2 bg-green-500 mr-2 -translate-y-[1px]"></span>
                SYS.STATUS: ONLINE
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500">
                Ayush Ojha
              </h1>
              <h2 className="text-xl md:text-2xl text-gray-400 font-mono mb-8 italic flex items-center gap-2">
                <Terminal size={24} className="text-white/50" />
                Developer & AI Enthusiast
              </h2>

              <p className="text-gray-300 leading-relaxed mb-10 max-w-2xl text-justify border-l-[3px] border-white pl-6 text-lg">
                A motivated B.Tech student in Information Technology with a strong foundation in Python and Java. Passionate about the intersection of software development and Artificial Intelligence, focused on building scalable, AI-driven applications.
              </p>

              <div className="flex flex-wrap gap-4 font-mono text-sm">
                <a href="https://github.com/Ayusjih" target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-white/20 px-5 py-3 hover:bg-white hover:text-black transition-colors duration-300 bg-black">
                  <Github size={18} /> GITHUB
                </a>
                <a href="https://linkedin.com/in/ayush-ojha-447048344/" target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-white/20 px-5 py-3 hover:bg-white hover:text-black transition-colors duration-300 bg-black">
                  <Linkedin size={18} /> LINKEDIN
                </a>
                <a href="mailto:Ayushojha992005@gmail.com" className="flex items-center gap-2 border border-white/20 px-5 py-3 hover:bg-white hover:text-black transition-colors duration-300 bg-black">
                  <Mail size={18} /> EMAIL
                </a>
              </div>
              <div className="mt-8 flex items-center gap-2 text-gray-500 font-mono text-xs uppercase px-1">
                <MapPin size={14} /> Gwalior, MP
              </div>
            </div>

            <div className="shrink-0 relative">
              {/* Accents for rigid look */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-white"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-white"></div>
              <div className="w-56 h-56 md:w-72 md:h-72 border border-white/20 p-2 bg-[#111]">
                <div className="w-full h-full bg-black overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                  <img
                    src={avatarSrc}
                    alt="Ayush Ojha"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = myImage;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SKILLS GRID ================= */}
        <section id="skills">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight mb-8 flex items-center gap-4">
            <span className="text-white/30 font-mono text-xl">01 //</span> Core Competencies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm">
            {/* Languages */}
            <div className="border border-white/10 p-8 bg-[#111] hover:border-white/40 transition-colors group">
              <h3 className="text-white font-bold mb-6 flex justify-between items-center border-b border-white/10 pb-4">
                <span>[ LANGUAGES ]</span>
                <span className="text-white/20 group-hover:text-white/50 transition-colors">001</span>
              </h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">Java (Core/Advanced)</li>
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">Python</li>
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">SQL</li>
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">C++</li>
              </ul>
            </div>

            {/* Technical Domains */}
            <div className="border border-white/10 p-8 bg-[#111] hover:border-white/40 transition-colors group">
              <h3 className="text-white font-bold mb-6 flex justify-between items-center border-b border-white/10 pb-4">
                <span>[ DOMAINS ]</span>
                <span className="text-white/20 group-hover:text-white/50 transition-colors">002</span>
              </h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">Object-Oriented Programming (OOP)</li>
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">AI-ML</li>
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">Cloud-Based Networks</li>
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">Web Safety</li>
              </ul>
            </div>

            {/* Soft Skills */}
            <div className="border border-white/10 p-8 bg-[#111] hover:border-white/40 transition-colors group">
              <h3 className="text-white font-bold mb-6 flex justify-between items-center border-b border-white/10 pb-4">
                <span>[ SOFT_SKILLS ]</span>
                <span className="text-white/20 group-hover:text-white/50 transition-colors">003</span>
              </h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">Leadership</li>
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">Teamwork</li>
                <li className="flex items-start before:content-['>'] before:mr-3 before:text-white/30 text-white hover:text-white transition-colors">Excellent Verbal Public Relations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ================= EDUCATION & ACHIEVEMENTS INFO ================= */}
        <section className="flex flex-col lg:flex-row gap-12">

          {/* Education Sidebar Space */}
          <div className="lg:w-1/3 space-y-8" id="education">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight flex items-center gap-4">
              <span className="text-white/30 font-mono text-xl">02 //</span> Education
            </h2>

            <div className="border border-white/10 p-8 bg-[#111] relative hover:bg-black transition-colors duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
              <div className="flex items-center gap-3 font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                <BookOpen size={14} /> Degree
              </div>
              <h4 className="font-bold text-xl mt-3 mb-1">B.Tech in Information Technology</h4>
              <p className="text-gray-400 mb-6">ITM Gwalior</p>
              <div className="font-mono text-sm bg-black border border-white/10 inline-block px-4 py-2 text-white">
                Current GPA: <span className="text-white font-bold">7.9/10</span>
              </div>
            </div>

            <div className="border border-white/10 p-8 bg-[#111] relative hover:bg-black transition-colors duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
              <div className="flex items-center gap-3 font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                <Award size={14} /> Certification
              </div>
              <h4 className="font-bold text-lg mt-3 mb-1">Full Stack Java + DSA</h4>
              <p className="text-gray-400 mb-4">Coding Thinker</p>
              <div className="font-mono text-xs text-gray-500 border-t border-white/10 pt-4">
                90+ hours of Python certification
              </div>
            </div>
          </div>

          {/* Achievements Vertical Form */}
          <div className="lg:w-2/3 space-y-8" id="achievements">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight flex items-center gap-4">
              <span className="text-white/30 font-mono text-xl">03 //</span> Leadership
            </h2>
            <div className="space-y-6">

              {/* 1 */}
              <div className="border border-white/10 p-8 bg-[#111] flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-[#151515] transition-colors relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10 group-hover:bg-white transition-colors duration-500"></div>
                <div className="text-5xl text-white/5 font-bold font-mono min-w-[3rem] group-hover:text-white/20 transition-colors pt-2">01</div>
                <div>
                  <h4 className="font-extrabold text-xl mb-2 flex items-center gap-2">
                    Winner (Rank 1)
                  </h4>
                  <p className="text-gray-400 text-lg">2nd National Level Hack-Arena Hackathon</p>
                  <p className="text-white/30 font-mono text-xs uppercase mt-2">(Defence Theme)</p>
                </div>
              </div>

              {/* 2 */}
              <div className="border border-white/10 p-8 bg-[#111] flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-[#151515] transition-colors relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10 group-hover:bg-white transition-colors duration-500"></div>
                <div className="text-5xl text-white/5 font-bold font-mono min-w-[3rem] group-hover:text-white/20 transition-colors pt-2">02</div>
                <div>
                  <h4 className="font-extrabold text-xl mb-2 flex items-center gap-2">
                    Rank 2
                  </h4>
                  <p className="text-gray-400 text-lg">Gwalior Police Cybersecurity Hackathon</p>
                </div>
              </div>

              {/* 3 */}
              <div className="border border-white/10 p-8 bg-[#111] flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-[#151515] transition-colors relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10 group-hover:bg-white transition-colors duration-500"></div>
                <div className="text-5xl text-white/5 font-bold font-mono min-w-[3rem] group-hover:text-white/20 transition-colors pt-2">03</div>
                <div>
                  <h4 className="font-extrabold text-xl mb-2 flex items-center gap-2">
                    Key Member
                  </h4>
                  <p className="text-gray-400 text-lg">Google Developer Student Club (GDSC)</p>
                </div>
              </div>

            </div>
          </div>

        </section>

      </main>

      {/* Footer minimal */}
      <footer className="mt-24 border-t border-white/10 py-8 text-center font-mono text-xs text-white/30">
        <p>SYSTEM.HALT // END OF PROFILE</p>
      </footer>
    </div>
  );
};

export default Developers;
