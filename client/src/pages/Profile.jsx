import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const PlatformCard = ({ name, handle, stats, colorTheme }) => {
  const getProgress = (rating, max) => Math.min((rating / max) * 100, 100);
  
  // Define max ratings for progress bars
  const maxRatings = { LeetCode: 3000, CodeChef: 3000, Codeforces: 3500, HackerRank: 1000, GeeksForGeeks: 3000 };
  const progress = getProgress(stats.rating || 0, maxRatings[name] || 2000);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className={`${colorTheme.bg} px-6 py-4 flex justify-between items-center`}>
        <h3 className={`font-bold text-white text-lg`}>{name}</h3>
        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          {handle}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500 font-medium">Rating Progress</span>
            <span className="text-gray-900 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className={`${colorTheme.bar} h-2 rounded-full transition-all duration-1000`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-600 text-sm">Problems Solved</span>
            <span className="text-gray-900 font-bold text-lg">{stats.problems_solved || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-600 text-sm">Current Rating</span>
            <span className="text-gray-900 font-bold">{stats.rating || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 text-sm">Global Rank</span>
            <span className="text-gray-900 font-bold">#{stats.global_rank > 0 ? stats.global_rank.toLocaleString() : 'N/A'}</span>
          </div>
        </div>

        <button className={`w-full mt-6 py-2.5 rounded-lg text-sm font-bold text-white ${colorTheme.btn} transition-opacity hover:opacity-90`}>
          View Details
        </button>
      </div>
    </div>
  );
};

const Profile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/platforms/profile/${user.uid}`);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [auth.currentUser]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;
  if (!data) return <div className="p-10 text-center">User data not found.</div>;

  const { user, platforms } = data;

  // Helper to find specific platform data
  const getPlat = (name) => platforms.find(p => p.platform_name === name) || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER PROFILE CARD --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{user.full_name}</h1>
              <p className="text-gray-500 font-medium">{user.enrollment_number}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">{user.branch}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">Sem {user.semester}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/edit-profile')} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
              Edit Platforms
            </button>
            <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors">
              Dashboard
            </button>
          </div>
        </div>

        {/* --- PLATFORM CARDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <PlatformCard 
            name="LeetCode" 
            handle={getPlat('LeetCode').platform_handle || 'Not Connected'} 
            stats={getPlat('LeetCode')}
            colorTheme={{ bg: 'bg-yellow-500', bar: 'bg-yellow-500', btn: 'bg-yellow-500' }}
          />

          <PlatformCard 
            name="CodeChef" 
            handle={getPlat('CodeChef').platform_handle || 'Not Connected'} 
            stats={getPlat('CodeChef')}
            colorTheme={{ bg: 'bg-red-500', bar: 'bg-red-500', btn: 'bg-red-500' }}
          />

          <PlatformCard 
            name="GeeksForGeeks" 
            handle={getPlat('GeeksForGeeks').platform_handle || 'Not Connected'} 
            stats={getPlat('GeeksForGeeks')}
            colorTheme={{ bg: 'bg-green-600', bar: 'bg-green-600', btn: 'bg-green-600' }}
          />

          <PlatformCard 
            name="Codeforces" 
            handle={getPlat('Codeforces').platform_handle || 'Not Connected'} 
            stats={getPlat('Codeforces')}
            colorTheme={{ bg: 'bg-blue-600', bar: 'bg-blue-600', btn: 'bg-blue-600' }}
          />

          <PlatformCard 
            name="HackerRank" 
            handle={getPlat('HackerRank').platform_handle || 'Not Connected'} 
            stats={getPlat('HackerRank')}
            colorTheme={{ bg: 'bg-green-500', bar: 'bg-green-500', btn: 'bg-green-500' }}
          />

        </div>
      </div>
    </div>
  );
};

export default Profile;