const axios = require('axios');

async function fetchCodeChefStats(username) {
    try {
        if (!username) return null;
        
        console.log(`🔍 Fetching CodeChef stats for: ${username}`);
        const url = `https://www.codechef.com/users/${username}`;
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = response.data;
        
        if (html.includes("New to CodeChef?")) {
            console.log(`❌ User ${username} not found on CodeChef`);
            return null;
        }

        let rating = 0;
        let solved = 0;
        let stars = 0;

        const ratingMatch = html.match(/<div class="rating-number">(\d+)<\/div>/);
        if (ratingMatch && ratingMatch[1]) rating = parseInt(ratingMatch[1], 10);

        const solvedMatch = html.match(/Fully Solved\s*\((\d+)\)/);
        if (solvedMatch && solvedMatch[1]) solved = parseInt(solvedMatch[1], 10);

        const starsMatch = html.match(/<div class="rating-star">\s*(\d+)\s*<\/div>/);
        if (starsMatch && starsMatch[1]) stars = parseInt(starsMatch[1], 10);

        return { rating, solved, stars ,solved};

    } catch (error) {
        console.error(`❌ Error fetching CodeChef for ${username}:`, error.message);
        return null;
    }
}

module.exports = fetchCodeChefStats;