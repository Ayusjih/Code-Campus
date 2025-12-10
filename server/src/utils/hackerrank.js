const axios = require('axios');

async function fetchHackerRank(username) {
    try {
        // 1. Automatic Cleaning: Remove '@' and trim spaces
        const cleanUsername = username.replace('@', '').trim();

        console.log(`🔍 Fetching HackerRank for: ${cleanUsername}`);

        // 2. HackerRank Internal API (Badges Endpoint)
        // This endpoint gives us Stars and often "solved" count per domain
        const url = `https://www.hackerrank.com/rest/hackers/${cleanUsername}/badges`;
        
        // 3. Advanced Headers (Crucial to prevent 403 Forbidden)
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

        // 4. Score & Problems Calculation Logic
        let totalStars = 0;
        let totalSolved = 0;

        data.models.forEach(badge => {
            // Sum up stars
            totalStars += badge.stars || 0;
            
            // Sum up solved problems if the API provides it (usually present in badge details)
            // If specific badge solved count isn't there, we assume 0 for that badge
            if (badge.solved) {
                totalSolved += badge.solved;
            }
        });

        // 5. Calculate Rating (Custom Logic)
        // Since HackerRank doesn't have a single "Rating" like Codeforces, 
        // we simulate it: 1 Star = 50 points (Adjust as needed)
        // If they have 0 stars but data exists, give 10 points to show connection.
        const calculatedRating = totalStars > 0 ? totalStars * 50 : 10;

        console.log(`✅ Success! ${cleanUsername}: ${totalStars} Stars, ${totalSolved} Solved`);

        // 6. Return Standard Object matching your Controller
        return {
            handle: cleanUsername,
            rating: calculatedRating,      // Used for the graph
            globalRank: "N/A",             // Badges don't have global rank
            problemsSolved: totalSolved    // Used for total count
        };

    } catch (error) {
        // Error Handling
        if (error.response && error.response.status === 404) {
            console.log(`❌ HackerRank User '${username}' not found (404)`);
        } else {
            console.error("❌ HackerRank API Error:", error.message);
        }
        return null;
    }
}

module.exports = { fetchHackerRank };