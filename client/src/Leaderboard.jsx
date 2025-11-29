import React, { useState, useEffect, useRef } from 'react';

// --- ROW COMPONENT (User Row Logic) ---
const TableRow = ({ student, index, isSticky = false, rowRef = null, onInspect, currentUserEmail, getRatingColor }) => (
    <tr 
        ref={rowRef}
        key={index} 
        onClick={() => onInspect(student)} 
        className={`transition-all duration-200 cursor-pointer border-b border-gray-100 
            ${isSticky ? 'sticky bottom-0 z-30 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg border-t-2 border-indigo-200' : 'hover:bg-indigo-50/30 bg-white'}
            ${student.email === currentUserEmail && !isSticky ? 'bg-blue-50/50 hover:bg-blue-50' : ''}
        `}
    >
        <td className="py-4 px-3 font-semibold text-gray-700 text-center w-16">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto ${
                index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                index === 1 ? 'bg-gray-100 text-gray-600' : 
                index === 2 ? 'bg-orange-100 text-orange-600' : 
                'bg-gray-50 text-gray-500'
            }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
            </div>
        </td>
        <td className="py-4 px-4">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                    isSticky ? 'bg-indigo-600 text-white border-indigo-600' : 
                    student.email === currentUserEmail ? 'bg-blue-500 text-white border-blue-500' :
                    'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 border-gray-200'
                }`}>
                    {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm truncate ${
                            isSticky ? 'text-indigo-900' : 
                            student.email === currentUserEmail ? 'text-blue-800' :
                            'text-gray-800'
                        }`}>
                            {student.name}
                        </span>
                        {student.role === 'alumni' && (
                            <span className="text-[10px] bg-gradient-to-r from-gray-100 to-gray-50 px-2 py-1 rounded-full font-semibold text-gray-500 border border-gray-200 shadow-sm">
                                ALUMNI
                            </span>
                        )}
                        {student.email === currentUserEmail && !isSticky && (
                            <span className="text-[10px] bg-gradient-to-r from-green-100 to-green-50 text-green-700 px-2 py-1 rounded-full font-semibold border border-green-200 shadow-sm">
                                YOU
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span>{student.branch}</span>
                        <span>•</span>
                        <span>{student.role === 'alumni' ? 'Graduated' : `Sem ${student.semester}`}</span>
                    </div>
                </div>
            </div>
        </td>
        <td className="py-4 px-3 text-center">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-1 ${
                isSticky ? 'bg-indigo-100 text-indigo-700' : 
                student.email === currentUserEmail ? 'bg-blue-100 text-blue-700' :
                'bg-gray-50 text-gray-700'
            }`}>
                <span className="text-xs">🏆</span>
                {parseInt(student.total_score).toLocaleString()}
            </span>
        </td>
        <td className="py-4 px-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-semibold border border-green-100 min-w-8">
                    {student.lc_easy || 0}
                </span>
                <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-semibold border border-yellow-100 min-w-8">
                    {student.lc_medium || 0}
                </span>
                <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-100 min-w-8">
                    {student.lc_hard || 0}
                </span>
            </div>
        </td>
        <td className="py-4 px-3 text-center">
            {student.cf_rating ? (
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRatingColor(student.cf_rating)} bg-opacity-10`}>
                    {student.cf_rating}
                </span>
            ) : (
                <span className="text-gray-300 text-sm">—</span>
            )}
        </td>
        <td className="py-4 px-3 text-center">
            {student.cc_rating ? (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 bg-gray-100">
                    {student.cc_rating}
                </span>
            ) : (
                <span className="text-gray-300 text-sm">—</span>
            )}
        </td>
        <td className="py-4 px-3 text-center">
            {student.hackerrank_score ? (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-green-600 bg-green-50 border border-green-100">
                    {student.hackerrank_score}
                </span>
            ) : (
                <span className="text-gray-300 text-sm">—</span>
            )}
        </td>
        <td className="py-4 px-3 text-center bg-gray-50/30 border-l border-gray-100">
            {student.college_contest_points > 0 ? (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-100">
                    +{student.college_contest_points}
                </span>
            ) : (
                <span className="text-gray-300 text-xs">—</span>
            )}
        </td>
    </tr>
);

const Leaderboard = ({ onBack, onInspect }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [isUserVisible, setIsUserVisible] = useState(false); 
  const [coderOfWeek, setCoderOfWeek] = useState(null);

  const userRowRef = useRef(null); 
  const tableContainerRef = useRef(null);

  const [filterBranch, setFilterBranch] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterSem, setFilterSem] = useState('All');

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('codecampus_user'));
    if (savedUser) setCurrentUserEmail(savedUser.email);

    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard) {
             setUsers(data.leaderboard);
             setCoderOfWeek(data.coderOfWeek); 
        } else {
             setUsers(data);
             if (data.length > 0) setCoderOfWeek(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading leaderboard:", err);
        setLoading(false);
      });
  }, []);

  // Visibility Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsUserVisible(entry.isIntersecting),
      { root: tableContainerRef.current, threshold: 0.1 }
    );
    if (userRowRef.current) observer.observe(userRowRef.current);
    return () => { if (userRowRef.current) observer.unobserve(userRowRef.current); };
  }, [users, filterBranch, filterYear, filterSem, currentUserEmail]);

  const filteredUsers = users.filter(user => {
    const branchMatch = filterBranch === 'All' || user.branch === filterBranch;
    const yearMatch = filterYear === 'All' || (user.year && user.year.toString() === filterYear);
    const semMatch = filterSem === 'All' || (user.semester && user.semester.toString() === filterSem);
    if (user.role === 'alumni') return branchMatch && filterYear === 'All' && filterSem === 'All';
    return branchMatch && yearMatch && semMatch;
  });

  const currentUserIndex = filteredUsers.findIndex(u => u.email === currentUserEmail);
  const currentUserData = currentUserIndex !== -1 ? filteredUsers[currentUserIndex] : null;

  const getRatingColor = (rating) => {
    if (rating === 0) return "text-gray-400 bg-gray-100"; 
    if (rating < 1200) return "text-gray-600 bg-gray-100"; 
    if (rating < 1400) return "text-green-600 bg-green-100"; 
    if (rating < 1600) return "text-cyan-600 bg-cyan-100"; 
    if (rating < 1900) return "text-blue-600 bg-blue-100"; 
    if (rating < 2100) return "text-purple-600 bg-purple-100"; 
    if (rating < 2400) return "text-yellow-600 bg-yellow-100"; 
    return "text-red-600 bg-red-100"; 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/20 p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                 <span className="text-xl text-white">🏆</span>
             </div>
             <div>
                 <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
                 <p className="text-sm text-gray-600 mt-1">Real-time rankings across coding platforms</p>
             </div>
          </div>
          <button 
            onClick={onBack} 
            className="bg-white text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all shadow-sm border border-gray-200 hover:shadow-md flex items-center gap-2"
          >
            <span>←</span>
            Back to Dashboard
          </button>
        </div>

        {/* --- CODER OF THE WEEK BANNER --- */}
        {coderOfWeek && (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-2xl">
                <div className="p-6 flex flex-col lg:flex-row items-center gap-6 text-white">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white/30 shadow-2xl backdrop-blur-sm">
                            {coderOfWeek.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-2 rounded-full border-4 border-white shadow-lg">
                            <span className="text-sm">⭐</span>
                        </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                Coder of the Week
                            </span>
                            <span className="text-white/80 text-sm">🔥</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{coderOfWeek.name}</h2>
                        <p className="text-white/80 font-medium mb-4">
                            {coderOfWeek.branch} • {coderOfWeek.role === 'alumni' ? 'Alumni' : `Semester ${coderOfWeek.semester}`}
                        </p>
                        
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                                <p className="text-xs text-white/80 font-semibold uppercase mb-1">Overall Rank</p>
                                <p className="text-2xl font-bold">#1</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/30">
                                <p className="text-xs text-white font-semibold uppercase mb-1">Solved This Week</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold">+{coderOfWeek.weekly_solved_count || 0}</p>
                                    <span className="text-sm text-white/90 font-medium">Problems</span>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                                <p className="text-xs text-white/80 font-semibold uppercase mb-1">Total Score</p>
                                <p className="text-2xl font-bold">{parseInt(coderOfWeek.total_score).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => onInspect(coderOfWeek)} 
                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        View Profile
                        <span>→</span>
                    </button>
                </div>
            </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-gray-500 font-semibold text-sm">Filters:</span>
            
            <div className="flex flex-wrap gap-2">
              {['All Branches', 'CSE', 'IT', 'ECE', 'ME', 'CIVIL', 'AIML', 'DS', 'IOT'].map(b => (
                  <button 
                      key={b} 
                      onClick={() => setFilterBranch(b === 'All Branches' ? 'All' : b)} 
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          filterBranch === (b === 'All Branches' ? 'All' : b) 
                          ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                      {b}
                  </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200"></div>
            
            <select 
                className="p-2 border-none bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-200 cursor-pointer"
                onChange={(e) => setFilterYear(e.target.value)}
            >
                <option value="All">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
            </select>
            
            <select 
                className="p-2 border-none bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-200 cursor-pointer"
                onChange={(e) => setFilterSem(e.target.value)}
            >
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

            <div className="ml-auto bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-semibold text-gray-600">
                    Total: <span className="text-indigo-600">{filteredUsers.length}</span> students
                </span>
            </div>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col h-[65vh]">
          <div className="overflow-y-auto flex-grow relative" ref={tableContainerRef}>
            <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-sm text-gray-600 font-semibold sticky top-0 z-20 border-b border-gray-200">
                    <tr>
                        <th className="py-4 px-3 text-center w-16">Rank</th>
                        <th className="py-4 px-4">Student</th>
                        <th className="py-4 px-3 text-center">Total Score</th>
                        <th className="py-4 px-3 text-center">LeetCode</th>
                        <th className="py-4 px-3 text-center">Codeforces</th>
                        <th className="py-4 px-3 text-center">CodeChef</th>
                        <th className="py-4 px-3 text-center">HackerRank</th>
                        <th className="py-4 px-3 text-center bg-gray-100">Contest</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="8" className="py-16 text-center">
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                                <p className="text-gray-500 text-sm mt-2">Loading rankings...</p>
                            </td>
                        </tr>
                    ) : filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="py-16 text-center text-gray-400 text-sm">
                                No students found matching your filters.
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map((student, index) => (
                            <TableRow 
                                key={index} 
                                student={student} 
                                index={index} 
                                onInspect={onInspect}
                                currentUserEmail={currentUserEmail}
                                getRatingColor={getRatingColor}
                                rowRef={student.email === currentUserEmail ? userRowRef : null} 
                            />
                        ))
                    )}
                </tbody>
                {currentUserData && !isUserVisible && (
                    <tfoot className="sticky bottom-0 z-30 bg-white animate-fade-in border-t-2 border-indigo-200">
                        <TableRow 
                            student={currentUserData} 
                            index={currentUserIndex} 
                            isSticky={true} 
                            onInspect={onInspect}
                            currentUserEmail={currentUserEmail}
                            getRatingColor={getRatingColor}
                        />
                    </tfoot>
                )}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;