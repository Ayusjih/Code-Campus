import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [activeTab, setActiveTab] = useState('platforms');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('student'); // To check if user is teacher
  const [isHidden, setIsHidden] = useState(false); // Teacher visibility state
  
  const navigate = useNavigate();
  const auth = getAuth();

  const [formData, setFormData] = useState({
    LeetCode: '',
    CodeChef: '',
    Codeforces: '',
    GeeksForGeeks: '',
    HackerRank: ''
  });

  // Load existing data (Handles + Role + Visibility)
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const uid = user.uid;

        // 1. Fetch User Role
        const roleRes = await axios.get(`/api/platforms/role/${uid}`);
        setRole(roleRes.data.role);

        // 2. If Teacher, Fetch Visibility Status
        if (roleRes.data.role === 'teacher') {
            const visRes = await axios.get(`/api/platforms/visibility/${uid}`);
            setIsHidden(visRes.data.is_hidden);
        }

        // 3. Fetch Current Platform Handles
        const res = await axios.get(`/api/platforms/${uid}`);
        const currentData = { ...formData };
        
        res.data.forEach(p => {
          // Ensure the platform name matches our keys (case-sensitive)
          const key = p.platform_name; 
          if (currentData.hasOwnProperty(key)) {
            currentData[key] = p.platform_handle;
          }
        });
        setFormData(currentData);
        setLoading(false);

      } catch (error) {
        console.error("Error loading profile data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.currentUser]);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle Visibility (Teacher Only)
  const handleVisibilityToggle = async () => {
    try {
        const newState = !isHidden;
        setIsHidden(newState); // Optimistic UI update
        await axios.post(`/api/platforms/visibility`, {
            firebase_uid: auth.currentUser.uid,
            is_hidden: newState
        });
        alert(`You are now ${newState ? 'Hidden' : 'Visible'} on the leaderboard.`);
    } catch (err) {
        console.error(err);
        setIsHidden(!isHidden); // Revert on error
        alert("Failed to update visibility.");
    }
  };

  // Save Platform Handles
  const handleSave = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Send the data to the backend
      const response = await axios.put('/api/platforms/update-handles', {
        firebase_uid: user.uid,
        profiles: formData
      });

      // Check for partial success
      const results = response.data.results;
      const failed = results.filter(r => r.status === 'failed');

      if (failed.length > 0) {
          const failedNames = failed.map(f => f.platform).join(', ');
          alert(`Saved! But could not verify: ${failedNames}. Check usernames.`);
      } else {
          alert('All Profiles Updated Successfully!');
      }
      
      navigate('/dashboard'); 
    } catch (error) {
      console.error(error);
      alert('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.LeetCode) { 
      return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            View Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className={`px-6 py-4 font-medium text-sm ${activeTab === 'platforms' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('platforms')}
          >
            Edit Platforms
          </button>
          <button 
            className="px-6 py-4 font-medium text-sm text-gray-400 cursor-not-allowed"
            disabled
          >
            Academic Info (Coming Soon)
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8">
            {activeTab === 'platforms' && (
                <div className="space-y-6">
                    
                    {/* --- TEACHER PRIVACY TOGGLE (Only Visible to Teachers) --- */}
                    {role === 'teacher' && (
                        <div className="mb-8 p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-purple-800 flex items-center gap-2">
                                    Stealth Mode 🕵️‍♂️ 
                                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Teacher Only</span>
                                </h3>
                                <p className="text-sm text-purple-600 mt-1">Hide your profile from the public student leaderboard.</p>
                            </div>
                            <button 
                                onClick={handleVisibilityToggle}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isHidden ? 'bg-purple-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${isHidden ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <h2 className="text-xl font-semibold text-gray-800">Coding Profiles</h2>
                        <p className="text-gray-500 text-sm mt-1">Add your competitive programming profiles to track progress.</p>
                    </div>

                    <div className="space-y-4 max-w-2xl mx-auto">
                        
                        {/* LeetCode Input */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">LeetCode</label>
                            <input type="text" name="LeetCode" value={formData.LeetCode} onChange={handleChange} placeholder="LeetCode Username" className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                        </div>

                        {/* CodeChef Input */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CodeChef</label>
                            <input type="text" name="CodeChef" value={formData.CodeChef} onChange={handleChange} placeholder="CodeChef Handle" className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                        </div>

                         {/* Codeforces Input */}
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Codeforces</label>
                            <input type="text" name="Codeforces" value={formData.Codeforces} onChange={handleChange} placeholder="Codeforces Handle" className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                        </div>

                        {/* HackerRank Input */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">HackerRank</label>
                            <input type="text" name="HackerRank" value={formData.HackerRank} onChange={handleChange} placeholder="HackerRank Username" className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                        </div>

                        {/* GeeksForGeeks Input */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">GeeksForGeeks</label>
                            <input type="text" name="GeeksForGeeks" value={formData.GeeksForGeeks} onChange={handleChange} placeholder="GeeksForGeeks Handle" className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                        </div>

                        {/* Save Button */}
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className={`w-full mt-6 py-3 rounded-lg text-white font-semibold transition-colors
                                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? 'Validating & Fetching Data...' : 'Save Profiles'}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;