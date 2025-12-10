const axios = require('axios');
const cheerio = require('cheerio');

// Import modular scrapers
const { fetchHackerRank } = require('./hackerrank'); 
const { fetchCodeChef } = require('./codechef'); 

// 1. CODEFORCES (Fixed: Now counts solved problems)
const fetchCodeforces = async (handle) => {
    try {
        // Step A: User Info
        const userRes = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
        if (userRes.data.status !== 'OK') return null;
        const user = userRes.data.result[0];

        // Step B: User Submissions (To count solved)
        const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
        let uniqueSolved = 0;

        if (statusRes.data.status === 'OK') {
            const submissions = statusRes.data.result;
            const solvedSet = new Set();
            submissions.forEach(sub => {
                if (sub.verdict === 'OK' && sub.problem.name) {
                    // Create unique key per problem
                    solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
                }
            });
            uniqueSolved = solvedSet.size;
        }
        
        return {
            handle: user.handle,
            rating: user.rating || 0,
            globalRank: user.rank || 'unranked',
            problemsSolved: uniqueSolved 
        };
    } catch (err) {
        console.error('Codeforces Error:', err.message);
        return null;
    }
};

// 2. GEEKSFORGEEKS
const fetchGeeksForGeeks = async (handle) => {
    try {
        const url = `https://www.geeksforgeeks.org/user/${handle}/`;
        const { data } = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $ = cheerio.load(data);

        // Try extracting from Next.js Data
        const nextData = $('#__NEXT_DATA__').html();
        if (nextData) {
            const json = JSON.parse(nextData);
            const info = json.props?.pageProps?.userInfo;
            if (info) {
                return {
                    handle,
                    rating: info.score || 0,
                    globalRank: info.rank || 0,
                    problemsSolved: parseInt(info.total_problems_solved) || 0
                };
            }
        }
        return null;
    } catch (err) {
        console.error('GFG Error:', err.message);
        return null;
    }
};

module.exports = {
    fetchCodeforces,
    fetchGeeksForGeeks,
    fetchHackerRank, 
    fetchCodeChef    
};