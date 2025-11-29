const axios = require('axios');

async function fetchCodeforcesStats(username) {
    try {
        if (!username) return null;
        
        console.log(`🔍 Fetching Codeforces stats for: ${username}`);
        const infoUrl = `https://codeforces.com/api/user.info?handles=${username}`;
        const statusUrl = `https://codeforces.com/api/user.status?handle=${username}`;

        const [infoRes, statusRes] = await Promise.all([
            axios.get(infoUrl, { timeout: 10000 }),
            axios.get(statusUrl, { timeout: 15000 })
        ]);

        if (infoRes.data.status === 'OK' && statusRes.data.status === 'OK') {
            const user = infoRes.data.result[0];
            const submissions = statusRes.data.result;
            
            const solvedSet = new Set();
            submissions.forEach(sub => {
                if (sub.verdict === 'OK') {
                    solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`);
                }
            });

            return { 
                rating: user.rating || 0, 
                maxRating: user.maxRating || 0,
                rank: user.rank || 'unrated',
                 solved: userData.solvedCount || 0
            };
        }
        return null;
    } catch (error) {
        console.error(`❌ Error fetching Codeforces for ${username}:`, error.message);
        return null;
    }
}

module.exports = fetchCodeforcesStats;