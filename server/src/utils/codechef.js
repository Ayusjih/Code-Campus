const axios = require('axios');
const cheerio = require('cheerio');

async function fetchCodeChef(username) {
    try {
        const cleanUser = username.replace('@', '').trim();
        const url = `https://www.codechef.com/users/${cleanUser}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // 1. Check if user exists
        if ($('body').text().includes("New to CodeChef?")) {
             return null;
        }

        // 2. Extract Rating
        const rating = parseInt($('.rating-number').text(), 10) || 0;

        // 3. Extract Problems Solved
        // Searches for text like "Fully Solved (50)"
        let problemsSolved = 0;
        const solvedText = $('h5:contains("Fully Solved")').text(); 
        const solvedMatch = solvedText.match(/\((\d+)\)/);
        if (solvedMatch) {
            problemsSolved = parseInt(solvedMatch[1], 10);
        }

        // 4. Extract Global Rank
        let globalRank = 0;
        const rankText = $('.rating-ranks ul li:first-child strong').text();
        if (rankText) globalRank = parseInt(rankText, 10);

        return { 
            handle: cleanUser,
            rating,
            globalRank,
            problemsSolved
        };

    } catch (error) {
        console.error("CodeChef Fetch Error:", error.message);
        return null;
    }
}

module.exports = { fetchCodeChef };