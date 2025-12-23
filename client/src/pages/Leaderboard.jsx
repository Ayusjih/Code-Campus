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
                alt={student.full_name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-indigo-600">
                {student.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                {student.full_name || 'Unknown'}
              </span>
              {isMe && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  YOU
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {student.branch} • Year {student.year}
            </span>
          </div>
        </div>
      </td>

      {/* Stats */}
      <td className="py-4 px-4 text-center">
        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">
          {student.total_solved || 0}
        </span>
      </td>

      <td className="py-4 px-4 text-center font-black text-blue-600">
        {student.calculated_score || 0}
      </td>

      <td className="py-4 px-4 text-center">{student.leetcode_count || '-'}</td>
      <td className="py-4 px-4 text-center">{student.codeforces_count || '-'}</td>
      <td className="py-4 px-4 text-center">{student.codechef_count || '-'}</td>
      <td className="py-4 px-4 text-center">{student.hackerrank_count || '-'}</td>
      <td className="py-4 px-4 text-center">{student.gfg_count || '-'}</td>
    </tr>
  );
};

/* ---------- MAIN ---------- */
const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 bg-white border px-4 py-2 rounded"
      >
        ← Back
      </button>

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
                <td colSpan="9" className="text-center p-10">Loading...</td>
              </tr>
            ) : (
              users.map((u, i) => (
                <TableRow
                  key={u.email}
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
