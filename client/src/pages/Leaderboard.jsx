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
const TableRow = ({ student, index, isSticky, currentUserEmail, getRatingColor }) => {
    const isMe = student.email === currentUserEmail;
    
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

            {/* Student Name */}
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm
                        ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}
                    `}>
                        {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                {student.name || "Unknown"}
                            </span>
                            {isMe && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold tracking-wider">YOU</span>}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                            {student.branch} • Year {student.year}
                        </span>
                    </div>
                </div>
            </td>

            {/* Total Problems Solved (Count) */}
            <td className="py-4 px-4 text-center">
                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                    {parseInt(student.total_problems_solved || 0).toLocaleString()}
                </span>
            </td>

            {/* Weighted Score */}
            <td className="py-4 px-4 text-center">
                <span className="font-black text-blue-600 text-base tracking-tight">
                    {parseInt(student.total_score || 0).toLocaleString()}
                </span>
            </td>

            {/* LeetCode */}
            <td className="py-4 px-4 text-center text-xs font-medium text-gray-600">
                {student.lc_solved || 0}
            </td>
            
            {/* Codeforces */}
            <td className="py-4 px-4 text-center">
                {student.cf_rating > 0 ? (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getRatingColor(student.cf_rating)} bg-opacity-10`}>
                        {student.cf_rating}
                    </span>
                ) : <span className="text-gray-300">-</span>}
            </td>

            {/* Other Platforms */}
            <td className="py-4 px-4 text-center text-xs text-gray-600">{student.cc_rating || '-'}</td>
            <td className="py-4 px-4 text-center text-xs text-gray-600">{student.hr_score || '-'}</td>
            <td className="py-4 px-4 text-center text-xs text-gray-600">{student.gfg_score || '-'}</td>
        </tr>
    );
};

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [coderOfWeek, setCoderOfWeek] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();

    // --- FILTERS & SORTING STATE ---
    const [filterBranch, setFilterBranch] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [filterSem, setFilterSem] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'total_score', direction: 'desc' });

    const tableContainerRef = useRef(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) setCurrentUserEmail(user.email);
        });

        // Fetch Data
        axios.get('/api/platforms/leaderboard')
            .then(res => {
                const data = res.data.leaderboard || [];
                setUsers(data);
                if (res.data.coderOfWeek) setCoderOfWeek(res.data.coderOfWeek); 
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading leaderboard:", err);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    // --- SORTING HANDLER ---
    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    // --- DATA PROCESSING (Filter -> Sort) ---
    const processedUsers = useMemo(() => {
        let result = [...users];

        // 1. Filter
        if (filterBranch !== 'All') result = result.filter(u => u.branch === filterBranch);
        if (filterYear !== 'All') result = result.filter(u => u.year && u.year.toString() === filterYear);
        if (filterSem !== 'All') result = result.filter(u => u.semester && u.semester.toString() === filterSem);
        if (searchTerm) result = result.filter(u => u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                const valA = parseInt(a[sortConfig.key] || 0);
                const valB = parseInt(b[sortConfig.key] || 0);
                return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
            });
        }

        return result;
    }, [users, filterBranch, filterYear, filterSem, searchTerm, sortConfig]);

    const currentUserIndex = processedUsers.findIndex(u => u.email === currentUserEmail);
    const currentUserData = currentUserIndex !== -1 ? processedUsers[currentUserIndex] : null;

    const getRatingColor = (rating) => {
        if (rating < 1200) return "text-gray-500";
        if (rating < 1400) return "text-green-600";
        if (rating < 1600) return "text-cyan-600";
        if (rating < 1900) return "text-blue-600";
        if (rating < 2100) return "text-purple-600";
        if (rating < 2400) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Leaderboard</h1>
                        <p className="text-gray-500 mt-1 text-sm font-medium">Real-time competitive programming rankings</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
                    >
                        <span>←</span> Back to Dashboard
                    </button>
                </div>

                {/* --- Coder of Week Card (Hidden if Search Active) --- */}
                {coderOfWeek && !searchTerm && (
                    <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-2xl shadow-indigo-200 transform hover:scale-[1.01] transition-transform duration-300">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>

                        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white border-4 border-white/20 shadow-2xl flex items-center justify-center text-4xl font-black text-indigo-600">
                                    {coderOfWeek.name ? coderOfWeek.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-yellow-200">
                                    #1 TOP RANK
                                </div>
                            </div>

                            {/* Details */}
                            <div className="text-center md:text-left flex-1 text-white">
                                <div className="inline-block bg-indigo-500/30 backdrop-blur-md border border-indigo-400/30 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mb-3 text-indigo-100">
                                    Coder of the Week
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-2">{coderOfWeek.name}</h2>
                                <p className="text-indigo-200 font-medium text-lg mb-6">
                                    {coderOfWeek.branch} • Year {coderOfWeek.year}
                                </p>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Total Score</p>
                                        <p className="text-2xl font-black text-white">{parseInt(coderOfWeek.total_score).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Problems Solved</p>
                                        <p className="text-2xl font-black text-white">{parseInt(coderOfWeek.total_problems_solved || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FILTERS --- */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6 sticky top-4 z-20">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium" onChange={(e) => setFilterBranch(e.target.value)}>
                                <option value="All">All Branches</option>
                                <option value="CSE">CSE</option>
                                <option value="IT">IT</option>
                                <option value="ECE">ECE</option>
                                <option value="ME">ME</option>
                                <option value="CIVIL">CIVIL</option>
                            </select>
                            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium" onChange={(e) => setFilterYear(e.target.value)}>
                                <option value="All">All Years</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium" onChange={(e) => setFilterSem(e.target.value)}>
                                <option value="All">All Semesters</option>
                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                            </select>
                        </div>

                        <div className="relative w-full lg:w-96">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input type="search" className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-200 rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Search student name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* --- MAIN TABLE (With Scroll Snap) --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[65vh]">
                    <div 
                        className="overflow-y-auto flex-grow relative snap-y snap-mandatory scroll-pt-12" 
                        ref={tableContainerRef}
                    >
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="py-5 px-4 text-center w-20 bg-gray-50">Rank</th>
                                    <th className="py-5 px-4 bg-gray-50">Student</th>
                                    
                                    {/* Total Solved Header */}
                                    <th className="py-5 px-4 text-center cursor-pointer hover:bg-gray-100 bg-gray-50" onClick={() => handleSort('total_problems_solved')}>
                                        <div className="flex items-center justify-center">Count <SortIcon active={sortConfig.key === 'total_problems_solved'} direction={sortConfig.direction} /></div>
                                    </th>

                                    {/* Weighted Score Header */}
                                    <th className="py-5 px-4 text-center cursor-pointer hover:bg-gray-100 bg-gray-50" onClick={() => handleSort('total_score')}>
                                        <div className="flex items-center justify-center">Score <SortIcon active={sortConfig.key === 'total_score'} direction={sortConfig.direction} /></div>
                                    </th>

                                    {/* Platforms */}
                                    <th className="py-5 px-4 text-center bg-gray-50">LeetCode</th>
                                    <th className="py-5 px-4 text-center bg-gray-50">Codeforces</th>
                                    <th className="py-5 px-4 text-center bg-gray-50">CodeChef</th>
                                    <th className="py-5 px-4 text-center bg-gray-50">HackerRank</th>
                                    <th className="py-5 px-4 text-center bg-gray-50">GFG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="9" className="py-20 text-center text-gray-400">Loading rankings...</td></tr>
                                ) : processedUsers.length === 0 ? (
                                    <tr><td colSpan="9" className="py-20 text-center text-gray-400">No students found matching filters.</td></tr>
                                ) : (
                                    processedUsers.map((student, index) => (
                                        <TableRow 
                                            key={student.email || index} 
                                            student={student} 
                                            index={index} 
                                            currentUserEmail={currentUserEmail}
                                            getRatingColor={getRatingColor}
                                        />
                                    ))
                                )}
                            </tbody>
                            
                            {/* Sticky Footer for Current User */}
                            {currentUserData && processedUsers.length > 0 && (
                                <tfoot className="sticky bottom-0 z-40 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)]">
                                    <TableRow 
                                        student={currentUserData} 
                                        index={processedUsers.findIndex(u => u.email === currentUserEmail)} 
                                        isSticky={true} 
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