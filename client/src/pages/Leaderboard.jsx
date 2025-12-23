import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// --- ICONS ---
const SortIcon = ({ active, direction }) => (
  <svg className={`w-3 h-3 ml-1 transition-transform ${active ? 'text-blue-600' : 'text-gray-300'} ${direction === 'asc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 10l5-5 5 5H5z" />
    <path d="M5 14l5 5 5-5H5z" />
  </svg>
);

// --- ROW COMPONENT ---
const TableRow = ({ student, index, isSticky, currentUserEmail }) => {
    const isMe = student.email === currentUserEmail; //
    
    return (
        <tr className={`
            group transition-all duration-200 border-b border-gray-100 text-sm
            ${isSticky ? 'sticky bottom-0 z-30 bg-white border-t-2 border-blue-200 shadow-xl' : 'hover:bg-blue-50/40 bg-white'}
            ${isMe && !isSticky ? 'bg-blue-50/60' : ''}
        `}>
            {/* Rank */}
            <td className="py-4 px-4 text-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto font-bold text-xs
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400/30' : 
                      index === 1 ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-400/30' : 
                      index === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400/30' : 
                      'text-gray-500 bg-gray-50'}`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
            </td>

            {/* Student Name & Gmail DP */}
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex-shrink-0 overflow-hidden border border-gray-100 shadow-sm bg-gray-200">
                        {student.photo_url ? (
                            <img 
                                src={student.photo_url} 
                                alt="" 
                                className="h-full w-full object-cover" 
                                onError={(e) => { e.target.style.display = 'none'; }} 
                            />
                        ) : (
                            <div className={`h-full w-full flex items-center justify-center text-sm font-bold text-white
                                ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}
                            `}>
                                {student.full_name ? student.full_name.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                {student.full_name || student.name || "Unknown"}
                            </span>
                            {isMe && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold tracking-wider">YOU</span>}
                        </div>
                        <span className="text-xs text-gray-400 font-medium uppercase">
                            {student.branch} • Year {student.year}
                        </span>
                    </div>
                </div>
            </td>

            {/* Stats Columns */}
            <td className="py-4 px-4 text-center">
                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                    {parseInt(student.total_solved || 0).toLocaleString()}
                </span>
            </td>

            <td className="py-4 px-4 text-center">
                <span className="font-black text-blue-600 text-base tracking-tight">
                    {parseInt(student.calculated_score || 0).toLocaleString()}
                </span>
            </td>

            {/* Individual Platform Counts - */}
            <td className="py-4 px-4 text-center text-xs font-medium text-gray-600">{student.leetcode_count > 0 ? student.leetcode_count : '-'}</td>
            <td className="py-4 px-4 text-center text-xs font-medium text-gray-600">{student.codeforces_count > 0 ? student.codeforces_count : '-'}</td>
            <td className="py-4 px-4 text-center text-xs font-medium text-gray-600">{student.codechef_count > 0 ? student.codechef_count : '-'}</td>
            <td className="py-4 px-4 text-center text-xs font-medium text-gray-600">{student.hackerrank_count > 0 ? student.hackerrank_count : '-'}</td>
            <td className="py-4 px-4 text-center text-xs font-medium text-gray-600">{student.gfg_count > 0 ? student.gfg_count : '-'}</td>
        </tr>
    );
};

const Leaderboard = () => {
    const [users, setUsers] = useState([]); //
    const [loading, setLoading] = useState(true);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [coderOfWeek, setCoderOfWeek] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null); // New state for timestamp
    const navigate = useNavigate();
    const auth = getAuth();

    const [filterBranch, setFilterBranch] = useState('All'); //
    const [filterYear, setFilterYear] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'calculated_score', direction: 'desc' });

    const tableContainerRef = useRef(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) setCurrentUserEmail(user.email);
        });

        axios.get('/api/platforms/leaderboard') //
            .then(res => {
                const data = res.data.leaderboard || [];
                setUsers(data);
                if (res.data.coderOfWeek) setCoderOfWeek(res.data.coderOfWeek); 
                setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })); // Set time
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading leaderboard:", err);
                setLoading(false);
            });

        return () => unsubscribe();
    }, [auth]);

    const handleSort = (key) => { //
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
        setSortConfig({ key, direction });
    };

    const processedUsers = useMemo(() => { //
        let result = [...users];
        if (filterBranch !== 'All') result = result.filter(u => u.branch === filterBranch);
        if (filterYear !== 'All') result = result.filter(u => u.year && u.year.toString() === filterYear);
        if (searchTerm) result = result.filter(u => u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (sortConfig.key) {
            result.sort((a, b) => {
                const valA = parseInt(a[sortConfig.key] || 0);
                const valB = parseInt(b[sortConfig.key] || 0);
                return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
            });
        }
        return result;
    }, [users, filterBranch, filterYear, searchTerm, sortConfig]);

    const currentUserData = useMemo(() => 
        processedUsers.find(u => u.email === currentUserEmail), 
    [processedUsers, currentUserEmail]);

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Leaderboard</h1>
                        <p className="text-gray-500 mt-1 text-sm font-medium">Real-time competitive programming rankings</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all shadow-sm">
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT CONTENT */}
                    <div className="flex-1 min-w-0">
                        {coderOfWeek && !searchTerm && (
                            <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-2xl">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
                                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 text-white">
                                    <div className="relative">
                                        {coderOfWeek.photo_url ? (
                                            <img src={coderOfWeek.photo_url} alt="" className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white/20 shadow-2xl object-cover" />
                                        ) : (
                                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center text-4xl font-black text-indigo-600">
                                                {coderOfWeek.full_name ? coderOfWeek.full_name.charAt(0).toUpperCase() : 'C'}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">#1 TOP RANK</div>
                                    </div>
                                    <div className="text-center md:text-left flex-1">
                                        <div className="inline-block bg-indigo-500/30 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mb-3 text-indigo-100">Coder of the Week</div>
                                        <h2 className="text-3xl md:text-4xl font-bold mb-2">{coderOfWeek.full_name || coderOfWeek.name}</h2>
                                        <p className="text-indigo-200 font-medium mb-6">{coderOfWeek.branch} • Year {coderOfWeek.year}</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                            <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                                                <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Score</p>
                                                <p className="text-2xl font-black">{parseInt(coderOfWeek.calculated_score || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                                                <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Solved</p>
                                                <p className="text-2xl font-black">{parseInt(coderOfWeek.total_solved || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FILTERS */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
                            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                    <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none font-medium" onChange={(e) => setFilterBranch(e.target.value)}>
                                        <option value="All">All Branches</option>
                                        <option value="CSE">CSE</option><option value="IT">IT</option><option value="ECE">ECE</option>
                                    </select>
                                    <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none font-medium" onChange={(e) => setFilterYear(e.target.value)}>
                                        <option value="All">All Years</option>
                                        <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                                    </select>
                                </div>
                                <div className="relative w-full lg:w-96">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>
                                    <input type="search" className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-200 rounded-xl bg-gray-50 focus:ring-blue-500 outline-none" placeholder="Search student name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[65vh]">
                            <div className="overflow-y-auto flex-grow relative" ref={tableContainerRef}>
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="py-5 px-4 text-center w-20 bg-gray-50">Rank</th>
                                            <th className="py-5 px-4 bg-gray-50">Student</th>
                                            <th className="py-5 px-4 text-center cursor-pointer hover:bg-gray-100 bg-gray-50" onClick={() => handleSort('total_solved')}>
                                                <div className="flex items-center justify-center">Count <SortIcon active={sortConfig.key === 'total_solved'} direction={sortConfig.direction} /></div>
                                            </th>
                                            <th className="py-5 px-4 text-center cursor-pointer hover:bg-gray-100 bg-gray-50" onClick={() => handleSort('calculated_score')}>
                                                <div className="flex items-center justify-center">Score <SortIcon active={sortConfig.key === 'calculated_score'} direction={sortConfig.direction} /></div>
                                            </th>
                                            <th className="py-5 px-4 text-center bg-gray-50">LC</th>
                                            <th className="py-5 px-4 text-center bg-gray-50">CF</th>
                                            <th className="py-5 px-4 text-center bg-gray-50">CC</th>
                                            <th className="py-5 px-4 text-center bg-gray-50">HR</th>
                                            <th className="py-5 px-4 text-center bg-gray-50">GFG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="9" className="py-20 text-center text-gray-400 font-medium">Loading rankings...</td></tr>
                                        ) : processedUsers.length === 0 ? (
                                            <tr><td colSpan="9" className="py-20 text-center text-gray-400 font-medium">No students found.</td></tr>
                                        ) : (
                                            processedUsers.map((student, index) => (
                                                <TableRow key={student.email || index} student={student} index={index} currentUserEmail={currentUserEmail} />
                                            ))
                                        )}
                                    </tbody>
                                    {currentUserData && processedUsers.length > 0 && (
                                        <tfoot className="sticky bottom-0 z-40 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)]">
                                            <TableRow student={currentUserData} index={users.findIndex(u => u.email === currentUserEmail)} isSticky={true} currentUserEmail={currentUserEmail} />
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR: NOTES */}
                    <div className="w-full lg:w-80 flex flex-col gap-6">
                        {/* Real Data Mode - */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="font-bold text-gray-800">Real Data Mode</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 font-medium leading-relaxed">You are connected to the live database.</p>
                            <div className="space-y-2 text-xs">
                                <p><span className="font-bold text-orange-600">Codeforces:</span> Updates live via API.</p>
                                <p><span className="font-bold text-orange-600">Others:</span> Requires backend worker.</p>
                            </div>
                        </div>

                        {/* Score Weights - */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <h3 className="font-bold text-gray-800">Score Weights (XP)</h3>
                            </div>
                            <div className="space-y-4">
                                {[{ n: 'LeetCode', w: '1.2' }, { n: 'Codeforces', w: '1.2' }, { n: 'CodeChef', w: '1.0' }, { n: 'HackerRank', w: '0.8' }, { n: 'GeeksForGeeks', w: '0.5' }].map((item) => (
                                    <div key={item.n} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-medium">{item.n}</span>
                                        <span className="font-bold px-2 py-1 rounded-md text-[10px] bg-blue-50 text-blue-600">× {item.w}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rank Boost Strategy - */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-xl text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-yellow-300 font-bold">★</span>
                                <h3 className="font-bold">Rank Boost Strategy</h3>
                            </div>
                            <p className="text-sm leading-relaxed opacity-90">
                                Want to climb faster? Focus on solving problems on high-weight platforms like <span className="font-bold underline">Codeforces</span> and <span className="font-bold underline">LeetCode</span>.
                            </p>
                        </div>

                        {/* --- NEW LAST UPDATED TIMESTAMP --- */}
                        {lastUpdated && (
                            <div className="text-[10px] text-gray-400 text-center font-medium mt-auto">
                                Rankings last refreshed at: <span className="text-gray-500 font-bold">{lastUpdated}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
