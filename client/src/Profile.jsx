import React, { useState, useEffect } from 'react';

const Profile = ({ user, onBack, isReadOnly = false }) => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    leetcode_handle: user.leetcode_handle || '',
    codeforces_handle: user.codeforces_handle || '',
    codechef_handle: user.codechef_handle || '',
    hackerrank_handle: user.hackerrank_handle || ''
  });
  const [saving, setSaving] = useState(false);

  // Platform statistics data
  const platformStats = {
    leetcode: {
      problems_solved: user.lc_easy + user.lc_medium + user.lc_hard || 0,
      easy: user.lc_easy || 0,
      medium: user.lc_medium || 0,
      hard: user.lc_hard || 0,
      ranking: '#879',
      streak: '7 days'
    },
    codechef: {
      rating: user.cc_rating || 0,
      highest_rating: user.cc_rating || 0,
      stars: '1★',
      global_rank: '#197,874',
      problems_solved: user.cc_solved || 0
    },
    codeforces: {
      rating: user.cf_rating || 0,
      highest_rating: user.cf_rating || 0,
      rank: 'Newbie',
      problems_solved: user.cf_solved || 0
    },
    hackerrank: {
      score: user.hackerrank_score || 0,
      badges: 0,
      skills: []
    }
  };

  const handleSavePlatforms = async () => {
    setSaving(true);
    try {
      // Use Render backend URL, not localhost
      const res = await fetch('https://code-campus-2-r20.onrender.com/api/auth/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          // Add authorization if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          email: user.email, 
          ...formData 
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Platforms updated successfully!');
        setEditMode(false);
        
        // Update local user data with correct field names
        const updatedUser = { 
          ...user, 
          leetcode_handle: formData.leetcode_handle,
          codeforces_handle: formData.codeforces_handle,
          codechef_handle: formData.codechef_handle,
          hackerrank_handle: formData.hackerrank_handle
        };
        
        // Update localStorage if you're using it
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.email === user.email) {
          localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            ...updatedUser
          }));
        }
        
        // Optional: refresh the page or update parent component
        if (window.location) {
          window.location.reload();
        }
        
      } else {
        alert('Update failed: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Server error during update. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'leetcode': return '⚡';
      case 'codechef': return '👨‍🍳';
      case 'codeforces': return '📊';
      case 'hackerrank': return 'H';
      default: return '🔗';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'leetcode': return 'from-yellow-50 to-yellow-100 border-yellow-200';
      case 'codechef': return 'from-orange-50 to-orange-100 border-orange-200';
      case 'codeforces': return 'from-blue-50 to-blue-100 border-blue-200';
      case 'hackerrank': return 'from-green-50 to-green-100 border-green-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  // Map field names for display (optional)
  const getDisplayHandle = (platform) => {
    switch (platform) {
      case 'leetcode': return user.leetcode_handle || 'Not connected';
      case 'codeforces': return user.codeforces_handle || 'Not connected';
      case 'codechef': return user.codechef_handle || 'Not connected';
      case 'hackerrank': return user.hackerrank_handle || 'Not connected';
      default: return 'Not connected';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - NO CHANGES */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-semibold text-sm transition shadow-sm border border-gray-200 flex items-center gap-2"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your account and platform connections</p>
            </div>
          </div>
          
          {!isReadOnly && (
            <div className="flex items-center gap-3">
              {editMode ? (
                <>
                  <button 
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold text-sm transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSavePlatforms}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition"
                >
                  Edit Platforms
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile Header Card - NO CHANGES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-semibold">Roll Number</p>
                  <p className="text-gray-800 font-bold">{user.roll_number || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Branch</p>
                  <p className="text-gray-800 font-bold">{user.branch}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Semester</p>
                  <p className="text-gray-800 font-bold">{user.semester}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Year</p>
                  <p className="text-gray-800 font-bold">{user.year}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 px-4 py-2 rounded-lg">
                <p className="text-green-800 text-sm font-semibold">Active Student</p>
                <p className="text-green-600 text-xs">{user.role === 'alumni' ? 'Alumni' : 'Current'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - NO CHANGES */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-8">
          {[
            { id: 'statistics', label: 'Platform Statistics', icon: '📊' },
            { id: 'platforms', label: 'Edit Platforms', icon: '🔗' },
            { id: 'academic', label: 'Academic Info', icon: '🎓' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          
          {/* Statistics Tab - UPDATED FIELD NAMES */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Statistics</h3>
              
              {/* LeetCode Card */}
              <div className={`bg-gradient-to-r ${getPlatformColor('leetcode')} border rounded-2xl p-6`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                    {getPlatformIcon('leetcode')}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">LeetCode</h4>
                    <p className="text-gray-600 text-sm">{getDisplayHandle('leetcode')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/50 p-4 rounded-lg border border-yellow-100">
                    <p className="text-gray-500 text-sm">Problems Solved</p>
                    <p className="text-2xl font-bold text-gray-900">{platformStats.leetcode.problems_solved}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border border-yellow-100">
                    <p className="text-gray-500 text-sm">Easy/Med/Hard</p>
                    <p className="text-lg font-bold text-gray-900">
                      {platformStats.leetcode.easy}/{platformStats.leetcode.medium}/{platformStats.leetcode.hard}
                    </p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border border-yellow-100">
                    <p className="text-gray-500 text-sm">Current Streak</p>
                    <p className="text-lg font-bold text-gray-900">{platformStats.leetcode.streak}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border border-yellow-100">
                    <p className="text-gray-500 text-sm">Institute Rank</p>
                    <p className="text-lg font-bold text-gray-900">{platformStats.leetcode.ranking}</p>
                  </div>
                </div>
              </div>

              {/* CodeChef Card */}
              <div className={`bg-gradient-to-r ${getPlatformColor('codechef')} border rounded-2xl p-6`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-xl">
                    {getPlatformIcon('codechef')}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">CodeChef</h4>
                    <p className="text-gray-600 text-sm">{getDisplayHandle('codechef')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/50 p-4 rounded-lg border border-orange-100">
                    <p className="text-gray-500 text-sm">Current Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{platformStats.codechef.rating}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border border-orange-100">
                    <p className="text-gray-500 text-sm">Highest Rating</p>
                    <p className="text-lg font-bold text-gray-900">{platformStats.codechef.highest_rating}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border border-orange-100">
                    <p className="text-gray-500 text-sm">Stars</p>
                    <p className="text-lg font-bold text-yellow-600">{platformStats.codechef.stars}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border border-orange-100">
                    <p className="text-gray-500 text-sm">Global Rank</p>
                    <p className="text-lg font-bold text-gray-900">{platformStats.codechef.global_rank}</p>
                  </div>
                </div>
              </div>

              {/* Codeforces Card */}
              <div className={`bg-gradient-to-r ${getPlatformColor('codeforces')} border rounded-2xl p-6`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                    {getPlatformIcon('codeforces')}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Codeforces</h4>
                    <p className="text-gray-600 text-sm">{getDisplayHandle('codeforces')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white/50 p-4 rounded-lg border border-blue-100">
                    <p className="text-gray-500 text-sm">Current Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{platformStats.codeforces.rating}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border border-blue-100">
                    <p className="text-gray-500 text-sm">Rank</p>
                    <p className="text-lg font-bold text-gray-900">{platformStats.codeforces.rank}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border border-blue-100">
                    <p className="text-gray-500 text-sm">Problems Solved</p>
                    <p className="text-lg font-bold text-gray-900">{platformStats.codeforces.problems_solved}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Edit Platforms Tab - UPDATED FIELD NAMES */}
          {activeTab === 'platforms' && (
            <div className="max-w-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Manage Platform Connections</h3>
              <p className="text-gray-600 mb-6">Connect your coding platform accounts to track your progress automatically.</p>
              
              <div className="space-y-6">
                {[
                  { key: 'leetcode_handle', label: 'LeetCode Username', placeholder: 'Enter your LeetCode username' },
                  { key: 'codeforces_handle', label: 'Codeforces Handle', placeholder: 'Enter your Codeforces handle' },
                  { key: 'codechef_handle', label: 'CodeChef Username', placeholder: 'Enter your CodeChef username' },
                  { key: 'hackerrank_handle', label: 'HackerRank ID', placeholder: 'Enter your HackerRank ID' }
                ].map(platform => (
                  <div key={platform.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {platform.label}
                    </label>
                    <input
                      type="text"
                      value={formData[platform.key]}
                      onChange={(e) => handleInputChange(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      disabled={!editMode}
                    />
                  </div>
                ))}
              </div>
              
              {editMode && (
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePlatforms}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Academic Info Tab - NO CHANGES */}
          {activeTab === 'academic' && (
            <div className="max-w-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Academic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Personal Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-semibold text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Roll Number</p>
                      <p className="font-semibold text-gray-900">{user.roll_number || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Academic Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Branch</p>
                      <p className="font-semibold text-gray-900">{user.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Semester</p>
                      <p className="font-semibold text-gray-900">{user.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-semibold text-gray-900">{user.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold text-green-600">{user.role === 'alumni' ? 'Alumni' : 'Active Student'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2">Note</h5>
                <p className="text-sm text-blue-700">
                  Academic information is managed by the institution. Please contact administration for any updates to your academic details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
