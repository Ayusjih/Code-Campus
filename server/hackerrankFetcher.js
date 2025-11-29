const axios = require('axios');

async function fetchHackerRankStats(username) {
    try {
        if (!username) return null;
        
        console.log(`🔍 Fetching HackerRank stats for: ${username}`);
        const cleanUsername = username.replace('@', '').trim();
        const url = `https://www.hackerrank.com/rest/hackers/${cleanUsername}/badges`;
        
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        const data = response.data;
        if (!data || !data.models) return null;

        let totalStars = 0;
        let totalBadges = data.models.length;
        
        data.models.forEach(badge => { 
            totalStars += badge.stars || 0; 
        });
        
        const hackerrankScore = totalStars * 100;

        return { 
            score: hackerrankScore, 
             solved: userData.solvedCount || 0,
            badges: totalBadges
        };
    } catch (error) {
        console.error(`❌ Error fetching HackerRank for ${username}:`, error.message);
        return null;
    }
}

module.exports = fetchHackerRankStats;