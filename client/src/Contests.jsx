import React, { useState, useEffect, useCallback } from 'react';

// Mock Contest Data (Replace with API fetch in a real application)
const MOCK_CONTESTS = [
    {
        id: 1,
        title: "ITM Coding Challenge 2026",
        platform: "Codeforces",
        description: "The annual coding challenge for all ITM students. This event aims to foster a culture of competitive programming and problem-solving skills.",
        startTime: "2026-03-15T10:00:00Z", // March 15th, 2026
        duration: "2.5 hours",
        isLive: false,
    },
    {
        id: 2,
        title: "Web Dev Hackathon Prep",
        platform: "HackerRank",
        description: "A short practice round focusing on algorithms and data structures frequently encountered in web development interviews.",
        startTime: "2025-12-05T18:00:00Z", // December 5th, 2025
        duration: "1 hour",
        isLive: false,
    },
];

const PAST_CONTESTS = [
    {
        id: 3,
        title: "ITM CodeVerse 2025",
        platform: "LeetCode",
        date: "May 02, 2025",
        resultsLink: "#",
    },
    {
        id: 4,
        title: "Freshers' Algo Battle",
        platform: "CodeChef",
        date: "October 10, 2024",
        resultsLink: "#",
    },
];

// Utility function to calculate remaining time
const calculateTimeRemaining = (targetTime) => {
    const total = Date.parse(targetTime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
        total,
        days,
        hours,
        minutes,
        seconds,
    };
};

const CountdownTimer = ({ targetTime }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining(targetTime));

    useEffect(() => {
        if (timeLeft.total <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeRemaining(targetTime));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTime, timeLeft.total]);

    if (timeLeft.total <= 0) {
        return <span className="text-xl font-bold text-red-500">Contest is LIVE!</span>;
    }

    const TimeBlock = ({ value, label }) => (
        <div className="flex flex-col items-center bg-indigo-700/80 p-3 rounded-lg w-16 shadow-lg border border-indigo-600">
            <span className="text-2xl font-extrabold">{String(value).padStart(2, '0')}</span>
            <span className="text-xs font-medium uppercase mt-1 opacity-75">{label}</span>
        </div>
    );

    return (
        <div className="flex gap-4 text-white justify-center lg:justify-start">
            <TimeBlock value={timeLeft.days} label="Days" />
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <TimeBlock value={timeLeft.minutes} label="Mins" />
            <TimeBlock value={timeLeft.seconds} label="Secs" />
        </div>
    );
};


// --- Main Component ---
const Contests = ({ onNavigate }) => {
    // In a real app, you would fetch all contests and separate them based on the current date
    const upcomingContests = MOCK_CONTESTS.filter(c => Date.parse(c.startTime) > Date.now());
    const liveContests = MOCK_CONTESTS.filter(c => c.isLive);

    // Determines which contest to show in the main banner (Live > Nearest Upcoming)
    const primaryContest = liveContests[0] || upcomingContests.sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))[0];


    return (
        <div className="min-h-screen bg-gray-50 font-sans p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xl text-white">🔥</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Coding Contests</h1>
                            <p className="text-sm text-gray-600 mt-1">Stay updated on the latest ITM competitive events.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate('dashboard')} 
                        className="bg-white text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all shadow-sm border border-gray-200 hover:shadow-md flex items-center gap-2"
                    >
                        <span>←</span>
                        Back to Dashboard
                    </button>
                </div>

                {/* --- 1. PRIMARY CONTEST BANNER (Upcoming/Live) --- */}
                {primaryContest && (
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl shadow-2xl overflow-hidden mb-12 border-4 border-indigo-500/50">
                        <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                            
                            {/* Left Content */}
                            <div className="flex-1 text-center lg:text-left">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                                    {primaryContest.isLive ? 'Live Now' : 'Upcoming Contest'}
                                </span>
                                <h2 className="text-4xl font-extrabold mb-3">{primaryContest.title}</h2>
                                <p className="text-indigo-100 mb-6 max-w-lg mx-auto lg:mx-0">{primaryContest.description}</p>

                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                    <div className="flex items-center gap-2 bg-indigo-700/50 px-3 py-2 rounded-lg">
                                        <span className="text-yellow-400">📅</span>
                                        <span className="text-sm font-semibold">
                                            {new Date(primaryContest.startTime).toLocaleDateString()}
                                            {primaryContest.isLive ? '' : ' at ' + new Date(primaryContest.startTime).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-indigo-700/50 px-3 py-2 rounded-lg">
                                        <span className="text-yellow-400">⏱️</span>
                                        <span className="text-sm font-semibold">Duration: {primaryContest.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-indigo-700/50 px-3 py-2 rounded-lg">
                                        <span className="text-yellow-400">💻</span>
                                        <span className="text-sm font-semibold">Platform: {primaryContest.platform}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Countdown/Action */}
                            <div className="flex-shrink-0 text-center">
                                <h3 className="text-xl font-bold mb-4 opacity-90">Time Remaining:</h3>
                                
                                <CountdownTimer targetTime={primaryContest.startTime} />

                                <a 
                                    href={primaryContest.isLive ? "#live-link" : "#register-link"} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-6 inline-block bg-white text-indigo-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl transform hover:scale-105"
                                >
                                    {primaryContest.isLive ? 'Join Contest' : 'Register Now'}
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* --- 2. PAST CONTESTS --- */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-green-500 pb-2">
                        Past Contests & Results
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PAST_CONTESTS.map(contest => (
                            <div key={contest.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-xl transition">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{contest.platform}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{contest.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">Held on: {contest.date}</p>
                                </div>
                                
                                <a 
                                    href={contest.resultsLink}
                                    className="text-indigo-600 font-semibold hover:underline mt-4 inline-flex items-center gap-1 transition-colors"
                                >
                                    View Results →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- 3. RESOURCES/INFO BLOCK --- */}
                 <div className="bg-indigo-50 p-8 rounded-2xl border-2 border-indigo-200 text-center shadow-inner">
                    <h3 className="text-xl font-bold text-indigo-800 mb-2">Never Miss a Contest</h3>
                    <p className="text-indigo-600 mb-4">All official ITM coding contests are tracked here. Check this page regularly!</p>
                    <button 
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md"
                        onClick={() => alert("Simulated: Checking for global contest updates...")}
                    >
                        Sync Global Contests
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Contests;