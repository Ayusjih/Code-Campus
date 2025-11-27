import React, { useState, useEffect } from 'react';

const Leaderboard = ({ onBack, onInspect }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTERS STATE ---
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterSem, setFilterSem] = useState('All');

  // --- LOAD DATA ---
  useEffect(() => {
    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading leaderboard:", err);
        setLoading(false);
      });
  }, []);

  // --- FILTER LOGIC ---
  const filteredUsers = users.filter(user => {
    const branchMatch = filterBranch === 'All' || user.branch === filterBranch;
    const yearMatch = filterYear === 'All' || (user.year && user.year.toString() === filterYear);
    const semMatch = filterSem === 'All' || (user.semester && user.semester.toString() === filterSem);

    // Alumni Logic: Alumni 'All Years' aur 'All Semesters' mein dikhenge
    if (user.role === 'alumni') {
        return branchMatch && filterYear === 'All' && filterSem === 'All';
    }

    return branchMatch && yearMatch && semMatch;
  });

  // --- HELPER: RATING COLOR ---
  const getRatingColor = (rating) => {
    if (rating === 0) return "text-gray-500"; // Unrated
    if (rating < 1200) return "text-gray-500"; 
    if (rating < 1400) return "text-green-600"; 
    if (rating < 1600) return "text-cyan-600"; 
    if (rating < 1900) return "text-blue-600"; 
    if (rating < 2100) return "text-purple-600"; 
    if (rating < 2400) return "text-yellow-600"; 
    return "text-red-600"; 
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
      <div className="max-w-[98%] mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            🏆 College Leaderboard
          </h1>
          <button onClick={onBack} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm">
            ← Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 border border-gray-100 items-center">
          <span className="text-gray-500 font-medium text-sm">Filter:</span>
          
          <select className="p-2 border rounded-md bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setFilterBranch(e.target.value)}>
            <option value="All">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CIVIL">CIVIL</option>
            <option value="AIML">AIML</option>
            <option value="DS">Data Science</option>
            <option value="IOT">IOT</option>
          </select>

          <select className="p-2 border rounded-md bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setFilterYear(e.target.value)}>
            <option value="All">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <select className="p-2 border rounded-md bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setFilterSem(e.target.value)}>
            <option value="All">All Semesters</option>
            <option value="1">Sem 1</option>
            <option value="2">Sem 2</option>
            <option value="3">Sem 3</option>
            <option value="4">Sem 4</option>
            <option value="5">Sem 5</option>
            <option value="6">Sem 6</option>
            <option value="7">Sem 7</option>
            <option value="8">Sem 8</option>
          </select>

          <span className="ml-auto text-sm text-gray-400">Found: {filteredUsers.length}</span>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-indigo-600 text-white text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Name</th>
                <th className="p-4 text-center">Total Score</th>
                <th className="p-4">LeetCode</th>
                <th className="p-4 text-center">Codeforces</th>
                <th className="p-4 text-center">CodeChef</th>
                <th className="p-4 text-center">HackerRank</th>
                <th className="p-4 text-center bg-indigo-700">Contest Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                      <p className="text-gray-500 font-medium animate-pulse">Fetching latest ranks...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan="8" className="p-8 text-center text-gray-500">No students found.</td>
                </tr>
              ) : (
                filteredUsers.map((student, index) => (
                  <tr key={index}
                  onClick={() => onInspect(student)}
                  className="border-b hover:bg-indigo-50 transition duration-150 cursor-pointer group">
                    
                    {/* Rank */}
                    <td className="p-4 font-medium text-gray-600">
                       {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>

                    {/* Name & Alumni Badge */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{student.name}</span>
                        {student.role === 'alumni' && (
                           <div className="flex flex-col items-center leading-none" title={`Alumni - Batch of ${student.passout_year}`}>
                             <span className="text-gray-400 font-serif font-bold text-lg" style={{ textShadow: '1px 1px 0 #e5e7eb' }}>A</span>
                             <span className="text-[9px] text-gray-500 font-bold -mt-1">{student.passout_year}</span>
                           </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {student.branch} • {student.role === 'alumni' ? 'Graduated' : `Sem ${student.semester}`}
                      </div>
                    </td>

                    {/* Total Score */}
                    <td className="p-4 text-center">
                      <span className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-lg font-bold border border-indigo-100 text-lg">
                        {student.total_score}
                      </span>
                    </td>

                    {/* LeetCode */}
                    <td className="p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-green-600 bg-green-50 px-1 rounded">{student.lc_easy}E</span>
                            <span className="text-yellow-600 bg-yellow-50 px-1 rounded">{student.lc_medium}M</span>
                            <span className="text-red-600 bg-red-50 px-1 rounded">{student.lc_hard}H</span>
                        </div>
                    </td>

                    {/* Codeforces (FIXED: Show 0 if 0) */}
                    <td className="p-4 text-center">
                        {student.cf_rating !== null ? (
                            <span className={`font-bold ${getRatingColor(student.cf_rating)}`}>
                                {student.cf_rating}
                            </span>
                        ) : <span className="text-gray-300 text-xs">-</span>}
                    </td>

                    {/* CodeChef (FIXED: Show 0 if 0) */}
                    <td className="p-4 text-center">
                        {student.cc_rating !== null ? (
                            <span className="font-bold text-gray-700">{student.cc_rating}</span>
                        ) : <span className="text-gray-300 text-xs">-</span>}
                    </td>

                    {/* HackerRank (FIXED: Show 0 if 0) */}
                    <td className="p-4 text-center">
                        {student.hackerrank_score !== null ? (
                             <span className="text-green-600 font-bold">{student.hackerrank_score} pts</span>
                        ) : (
                            student.hackerrank_id ? <span className="text-xs text-green-500">Linked</span> : <span className="text-gray-300 text-xs">-</span>
                        )}
                    </td>

                    {/* Contests */}
                    <td className="p-4 text-center bg-gray-50 border-l border-gray-200">
                        {student.college_contest_points > 0 ? (
                            <span className="text-indigo-600 font-extrabold text-lg">+{student.college_contest_points}</span>
                        ) : <span className="text-gray-300">-</span>}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;