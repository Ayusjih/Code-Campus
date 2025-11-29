import React from 'react';
import TrendChart from './TrendChart';
import ScoreDistributionChart from './ScoreDistributionChart';
import PlatformDistributionChart from './PlatformDistributionChart';
import WeeklyProgressChart from './WeeklyProgressChart';

const PerformanceAnalytics = ({ user }) => {
  // Sample data - replace with actual API data
  const performanceData = {
    weeklyProgress: [12, 19, 8, 17, 22, 9, 14],
    platformDistribution: [
      { platform: 'LeetCode', score: 640, color: '#FF6384' },
      { platform: 'HackerRank', score: 360, color: '#36A2EB' },
      { platform: 'CodeChef', score: 280, color: '#FFCE56' },
      { platform: 'Codeforces', score: 420, color: '#4BC0C0' }
    ],
    performanceTrend: [65, 59, 80, 81, 56, 55, 70, 75, 82, 78, 85, 90],
    scoreDistribution: {
      labels: ['0-500', '501-1000', '1001-1500', '1501-2000', '2000+'],
      data: [12, 19, 15, 8, 3]
    }
  };

  const totalScore = performanceData.platformDistribution.reduce((sum, item) => sum + item.score, 0);
  const leetCodePercentage = Math.round((performanceData.platformDistribution[0].score / totalScore) * 100);
  const otherPercentage = 100 - leetCodePercentage;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Analytics</h1>
          <p className="text-gray-600">Track your coding progress and performance across platforms</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-gray-900">{totalScore}</div>
            <div className="text-sm text-gray-500">Total Score</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-gray-900">{leetCodePercentage}%</div>
            <div className="text-sm text-gray-500">LeetCode Score</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${leetCodePercentage}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-gray-900">{otherPercentage}%</div>
            <div className="text-sm text-gray-500">Other Platforms</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${otherPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-gray-900">#{user?.rank || '25'}</div>
            <div className="text-sm text-gray-500">Institute Rank</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Weekly Progress</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 7 days</span>
            </div>
            <WeeklyProgressChart data={performanceData.weeklyProgress} />
          </div>

          {/* Platform Distribution */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Score Distribution</h2>
              <span className="text-sm text-gray-500">By Platform</span>
            </div>
            <PlatformDistributionChart data={performanceData.platformDistribution} />
          </div>

          {/* Performance Trend */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Performance Trend</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 12 weeks</span>
            </div>
            <TrendChart data={performanceData.performanceTrend} />
          </div>

          {/* Score Distribution */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Score Distribution</h2>
              <span className="text-sm text-gray-500">By Rating Range</span>
            </div>
            <ScoreDistributionChart data={performanceData.scoreDistribution} />
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
            View Detailed Leaderboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default PerformanceAnalytics;