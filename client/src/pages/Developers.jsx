import React, { useEffect, useState } from "react";
import axios from "axios";
import myImage from "../assets/my1.jpg";
import { Github, Linkedin, Mail } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://codecampusbacnend.onrender.com');

const Developers = () => {
  const [devData, setDevData] = useState(null);
  const [content, setContent] = useState(null);
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

        const contentRes = await axios.get(`${BACKEND_URL}/api/developer/content`);
        setContent(contentRes.data);
      } catch (err) {
        console.error("Profile/Content fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  /* 🔒 SINGLE SOURCE OF TRUTH FOR IMAGE */
  const avatarSrc =
    devData?.avatar_url && devData.avatar_url.trim() !== ""
      ? devData.avatar_url
      : myImage;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      {/* PAGE TITLE */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Meet the Developer
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Aspiring IT professional with a strong academic foundation and a
          passion for building real-world solutions.
        </p>
      </div>

      {/* HERO CARD */}
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-blue-600 to-purple-700 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">

          {/* AVATAR */}
          <div className="shrink-0">
            <div className="w-40 h-40 md:w-44 md:h-44 rounded-full border-[6px] border-white/30 shadow-2xl overflow-hidden bg-white">
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

          {/* INFO */}
          <div className="text-center md:text-left text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-2">
              Ayush Ojha
            </h2>
            <p className="text-indigo-100 text-lg mb-1">
              Information Technology
            </p>
            <p className="text-white/80 mb-6">
              Full Stack Java Developer
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a
                href="https://github.com/Ayusjih"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 transition text-sm font-semibold"
              >
                <Github size={16} />
                Ayusjih
              </a>
              <a
                href="https://www.linkedin.com/in/ayush-ojha-447048344/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 transition text-sm font-semibold"
              >
                <Linkedin size={16} />
                LinkedIn
              </a>
              <a
                href="mailto:ayushojha992005@gmail.com"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 transition text-sm font-semibold"
              >
                <Mail size={16} />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* DEVELOPER CONTENT */}
      {content && (
        <div className="max-w-5xl mx-auto mt-12 grid gap-8 pb-10">

          {/* Education */}
          {content.education?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">🎓 Education</h3>
              <div className="space-y-6">
                {content.education.map((edu, i) => (
                  <div key={i} className="flex flex-col md:flex-row justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{edu.institution}</h4>
                      <p className="text-gray-600">{edu.degree} - {edu.department}</p>
                    </div>
                    <div className="text-left md:text-right mt-2 md:mt-0">
                      <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium inline-block">{edu.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {content.projects?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">🚀 Projects</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {content.projects.map((proj, i) => (
                  <div key={i} className="border border-gray-100 p-6 rounded-xl hover:shadow-md transition bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800 text-lg">{proj.title}</h4>
                      {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View ↗</a>}
                    </div>
                    {proj.category && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded inline-block mb-3">{proj.category}</span>}
                    <p className="text-gray-600 text-sm leading-relaxed">{proj.description}</p>
                    {proj.dates && <p className="text-xs text-gray-400 mt-4">{proj.dates}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {content.achievements?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">⭐ Achievements</h3>
              <ul className="space-y-4">
                {content.achievements.map((ach, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 bg-orange-50 max-w-2xl px-4 py-3 rounded-lg border border-orange-100">
                    <span className="text-orange-500 mt-0.5">★</span>
                    <span className="leading-relaxed font-medium">{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Developers;
