const axios = require('axios');
const cheerio = require('cheerio');

async function fetchCodeChef(username) {
    try {
        const cleanUser = username.replace('@', '').trim();
        const url = `https://www.codechef.com/users/${cleanUser}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'max-age=0'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // 1. Check if user exists
        const pageTitle = $('title').text();
        if (pageTitle.includes('Error Page') || 
            pageTitle.includes('Not Found') || 
            $('.m-content-html').text().includes('could not be found')) {
            return null;
        }

        // 2. Extract Rating
        let rating = 0;
        const ratingText = $('.rating-number').first().text().replace(/\D/g, '');
        rating = parseInt(ratingText, 10) || 0;

        // 3. Extract Problems Solved (CRITICAL FIX HERE)
        let problemsSolved = 0;
        
        // Strategy A: Search entire text for "Total Problems Solved: X" (Matches your screenshot)
        const pageText = $('body').text();
        const totalSolvedMatch = pageText.match(/Total Problems Solved:\s*(\d+)/i);

        if (totalSolvedMatch && totalSolvedMatch[1]) {
             problemsSolved = parseInt(totalSolvedMatch[1], 10);
        } else {
             // Strategy B: Fallback to "Fully Solved (X)" for older accounts
             const solvedText = $('h5:contains("Fully Solved")').text();
             const solvedMatch = solvedText.match(/\((\d+)\)/);
             if (solvedMatch) {
                 problemsSolved = parseInt(solvedMatch[1], 10);
             }
        }

        // 4. Extract Global Rank
        let globalRank = 0;
        const rankText = $('.rating-ranks ul li:first-child strong').text();
        if (rankText) {
             globalRank = parseInt(rankText, 10) || 0;
        }

        // 5. Extract Stars
        let stars = 'Unrated';
        const starsMatch = $('.rating-star').text().match(/(\d+)\s*★/);
        if (starsMatch) {
            stars = `${starsMatch[1]}★`;
        }

        return { 
            handle: cleanUser,
            rating,
            stars,
            globalRank,
            problemsSolved, // This will now correctly be 4
            profileUrl: url,
            fetchedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error("CodeChef Fetch Error:", error.message);
        return null;
    }
}



module.exports = { fetchCodeChef };
