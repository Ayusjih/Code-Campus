import React, { useEffect, useState } from "react";
import axios from "axios";
import myImage from "../assets/my1.jpg";

const BACKEND_URL = "https://code-campus-v3.onrender.com";

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
                className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 transition text-sm font-semibold"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/ayush-ojha-447048344"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 transition text-sm font-semibold"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developers;
