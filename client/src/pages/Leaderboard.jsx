import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

/* ---------- SORT ICON ---------- */
const SortIcon = ({ active, direction }) => (
  <svg
    className={`w-3 h-3 ml-1 transition-transform ${
      active ? 'text-blue-600' : 'text-gray-300'
    } ${direction === 'asc' ? 'rotate-180' : ''}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M5 10l5-5 5 5H5z" />
    <path d="M5 14l5 5 5-5H5z" />
  </svg>
);

/* ---------- TABLE ROW ---------- */
const TableRow = ({ student, index, isSticky, currentUserEmail }) => {
  const isMe = student.email === currentUserEmail;

  return (
    <tr
      className={`
        group transition-all duration-200 border-b border-gray-100 text-sm
        ${isSticky ? 'sticky bottom-0 z-30 bg-white border-t-2 border-blue-200 shadow-xl' : 'hover:bg-blue-50/40'}
        ${isMe && !isSticky ? 'bg-blue-50/60' : ''}
      `}
    >
      {/* Rank */}
      <td className="py-4 px-4 text-center">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto font-bold text-xs
            ${
              index === 0
                ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400/30'
                : index === 1
                ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-400/30'
                : index === 2
                ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400/30'
                : 'text-gray-500 bg-gray-50'
            }`}
        >
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
        </div>
      </td>

      {/* Student */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden border bg-gray-200 flex-shrink-0">
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt={student.name || 'avatar'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-indigo-600">
                {(student.name || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {student.name || 'Unknown'}
              </span>
              {isMe && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  YOU
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {student.branch || 'N/A'} • Year {student.year || 'N/A'}
            </span>
          </div>
        </div>
      </td>

      {/* Stats */}
      <td className="py-4 px-4 text-center">
        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">
          {student.total_problems_solved || 0}
        </span>
      </td>

      <td className="py-4 px-4 text-center font-black text-blue-600">
        {Math.round(student.total_score || 0)}
      </td>

      <td className="py-4 px-4 text-center">{student.lc_solved || '-'}</td>
      <td className="py-4 px-4 text-center">{student.cf_rating > 0 ? student.cf_rating : '-'}</td>
      <td className="py-4 px-4 text-center">{student.cc_rating > 0 ? student.cc_rating : '-'}</td>
      <td className="py-4 px-4 text-center">{student.hr_score > 0 ? student.hr_score : '-'}</td>
      <td className="py-4 px-4 text-center">{student.gfg_score > 0 ? student.gfg_score : '-'}</td>
    </tr>
  );
};

/* ---------- MAIN ---------- */
const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUserEmail(user.email);
    });

    axios.get('/api/platforms/leaderboard')
      .then((res) => {
        setUsers(res.data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => unsub();
  }, [auth]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const nameMatch = (u.name || '').toLowerCase().includes(searchTerm.trim().toLowerCase());
      const branchMatch = branchFilter ? u.branch === branchFilter : true;
      const yearMatch = yearFilter ? String(u.year) === String(yearFilter) : true;
      const semesterMatch = semesterFilter ? String(u.semester) === String(semesterFilter) : true;
      return nameMatch && branchMatch && yearMatch && semesterMatch;
    });
  }, [users, searchTerm, branchFilter, yearFilter, semesterFilter]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-white border px-4 py-2 rounded shadow-sm hover:bg-gray-50 font-medium self-start"
        >
          ← Back
        </button>
        
        {/* FILTERS AND SEARCH */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm flex-1 md:w-64"
          />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
          >
            <option value="">All Branches</option>
            <option value="CSE">Computer Science</option>
            <option value="IT">Information Tech</option>
            <option value="AIML">AI & ML</option>
            <option value="ME">Mechanical</option>
            <option value="CIVIL">Civil</option>
            <option value="IOT">IoT</option>
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="p-4 text-center">Rank</th>
              <th className="p-4">Student</th>
              <th className="p-4 text-center">Solved</th>
              <th className="p-4 text-center">Score</th>
              <th className="p-4 text-center">LC</th>
              <th className="p-4 text-center">CF</th>
              <th className="p-4 text-center">CC</th>
              <th className="p-4 text-center">HR</th>
              <th className="p-4 text-center">GFG</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center p-10 font-bold text-gray-500">Loading Leaderboard...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-10 font-bold text-gray-500">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((u, i) => (
                <TableRow
                  key={u.email || i}
                  student={u}
                  index={i}
                  currentUserEmail={currentUserEmail}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
