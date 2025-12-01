
// client/src/components/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://code-campus-2-r20j.onrender.com';

const AnalyticsDashboard = ({ user }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch user analytics and comparison data simultaneously
        const [analyticsResponse, comparisonResponse] = await Promise.all([
          fetch(`${API_BASE}/api/analytics/user/${user.email}`),
          fetch(`${API_BASE}/api/analytics/comparison/${user.email}`)
        ]);

        if (!analyticsResponse.ok || !comparisonResponse.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const analytics = await analyticsResponse.json();
        const comparison = await comparisonResponse.json();

        setAnalyticsData(analytics);
        setComparisonData(comparison);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchAnalyticsData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading your analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    );
  }

  const { userProfile, platformStats, overallMetrics, progressOverTime, skillDistribution } = analyticsData;

  // Platform comparison data for bar chart
  const platformComparisonData = [
    { name: 'LeetCode', solved: platformStats.leetcode.total, color: '#FFA116' },
    { name: 'Codeforces', solved: platformStats.codeforces.solved, color: '#3B82F6' },
    { name: 'CodeChef', solved: platformStats.codechef.solved, color: '#7C3AED' },
    { name: 'HackerRank', solved: platformStats.hackerrank.solved, color: '#00EA64' },
  ].filter(item => item.solved > 0);

  // Difficulty distribution for pie chart
  const difficultyData = [
    { name: 'Easy', value: platformStats.leetcode.easy, color: '#10B981' },
    { name: 'Medium', value: platformStats.leetcode.medium, color: '#F59E0B' },
    { name: 'Hard', value: platformStats.leetcode.hard, color: '#EF4444' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Total Problems Solved</h3>
          <p className="text-3xl font-bold text-indigo-600">{overallMetrics.totalProblemsSolved}</p>
          <p className="text-sm text-gray-500 mt-1">Across all platforms</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Total Score</h3>
          <p className="text-3xl font-bold text-green-600">{overallMetrics.totalScore}</p>
          <p className="text-sm text-gray-500 mt-1">Leaderboard ranking</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Weekly Progress</h3>
          <p className="text-3xl font-bold text-blue-600">+{overallMetrics.weeklySolved}</p>
          <p className="text-sm text-gray-500 mt-1">Problems this week</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Platforms Active</h3>
          <p className="text-3xl font-bold text-purple-600">{overallMetrics.platformCount}</p>
          <p className="text-sm text-gray-500 mt-1">Connected platforms</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Progress Over Time */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulativeSolved" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Total Solved"
              />
              <Line 
                type="monotone" 
                dataKey="problemsSolved" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Monthly Solved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Comparison */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Platform Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="solved" name="Problems Solved">
                {platformComparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty Distribution */}
        {difficultyData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Difficulty Distribution (LeetCode)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Comparative Analysis */}
        {comparisonData && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Comparative Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Your Solved Problems:</span>
                <span className="font-bold text-indigo-600">{comparisonData.userStats.totalSolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Branch Average:</span>
                <span className="text-gray-600">{comparisonData.branchComparison.avgSolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Average:</span>
                <span className="text-gray-600">{comparisonData.overallComparison.avgSolved}</span>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  You're in the top <strong>{comparisonData.percentile.overallPercentile}%</strong> of all students
                  {comparisonData.percentile.branchPercentile > 50 && (
                    <span> and top <strong>{100 - comparisonData.percentile.branchPercentile}%</strong> in your branch</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Platform Details */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Platform Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.leetcode.total > 0 && (
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h4 className="font-semibold text-orange-800">LeetCode</h4>
              <p className="text-sm text-orange-600">
                {platformStats.leetcode.easy}E • {platformStats.leetcode.medium}M • {platformStats.leetcode.hard}H
              </p>
            </div>
          )}
          {platformStats.codeforces.rating > 0 && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-blue-800">Codeforces</h4>
              <p className="text-sm text-blue-600">
                Rating: {platformStats.codeforces.rating} • Solved: {platformStats.codeforces.solved}
              </p>
            </div>
          )}
          {platformStats.codechef.rating > 0 && (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h4 className="font-semibold text-purple-800">CodeChef</h4>
              <p className="text-sm text-purple-600">
                Rating: {platformStats.codechef.rating} • Solved: {platformStats.codechef.solved}
              </p>
            </div>
          )}
          {platformStats.hackerrank.score > 0 && (
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-green-800">HackerRank</h4>
              <p className="text-sm text-green-600">
                Score: {platformStats.hackerrank.score} • Solved: {platformStats.hackerrank.solved}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
