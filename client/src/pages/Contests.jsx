import React from 'react';

const Contests = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl">
          🏆
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Contests</h1>
        <p className="text-gray-500 mb-8">
          We are building a curated list of upcoming contests from LeetCode, Codeforces, and CodeChef. Check back soon!
        </p>
        <button 
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Contests;