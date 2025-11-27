const axios = require('axios');

async function fetchHackerRankStats(username) {
    try {
        // 1. Automatic Cleaning: '@' aur spaces hata do
        const cleanUsername = username.replace('@', '').trim();

        console.log(`🔍 Fetching HackerRank for: ${cleanUsername}`);

        // 2. HackerRank Internal API (Badges Endpoint)
        const url = `https://www.hackerrank.com/rest/hackers/${cleanUsername}/badges`;
        
        // 3. Advanced Headers (Taaki HackerRank block na kare)
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Referer': `https://www.hackerrank.com/${cleanUsername}`,
                'Origin': 'https://www.hackerrank.com'
            }
        });

        const data = response.data;

        if (!data || !data.models) {
            console.log(`❌ HackerRank User ${cleanUsername} not found (No Models)`);
            return null;
        }

        // 4. Score Calculation Logic
        let totalStars = 0;
        data.models.forEach(badge => {
            totalStars += badge.stars || 0;
        });

        // Agar stars mile hain toh score banao (Example: 1 Star = 100 pts)
        // Agar 0 stars hain, toh kam se kam 10 pts de do taaki pata chale connect ho gaya
        const hackerrankScore = totalStars > 0 ? totalStars * 100 : 10;

        console.log(`✅ Success! ${cleanUsername}: ${totalStars} Stars, Score=${hackerrankScore}`);

        return { score: hackerrankScore, stars: totalStars };

    } catch (error) {
        // Error Printing
        if (error.response && error.response.status === 404) {
            console.log(`❌ HackerRank User '${username}' not found (404)`);
        } else {
            console.error("❌ HackerRank API Error:", error.message);
        }
        return null;
    }
}

module.exports = fetchHackerRankStats;