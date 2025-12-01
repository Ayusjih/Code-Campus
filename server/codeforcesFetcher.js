const axios = require('axios');

async function fetchCodeforcesStats(username) {
    try {
        // Official API (No key required)
        const url = `https://codeforces.com/api/user.info?handles=${username}`;
        const response = await axios.get(url);
        
        const data = response.data;

        if (data.status === 'OK' && data.result.length > 0) {
            const user = data.result[0];
            // Agar rating abhi nahi mili (unrated), toh 0 maano
            const rating = user.rating || 0;
            const rank = user.rank || 'unrated';

            console.log(`✅ Codeforces ${username}: Rating=${rating}, Rank=${rank}`);
            return { rating, rank };
        }
        return null;
    } catch (error) {
        console.error(`❌ Codeforces Error for ${username}: User not found or API down.`);
        return null;
    }
}

module.exports = fetchCodeforcesStats;