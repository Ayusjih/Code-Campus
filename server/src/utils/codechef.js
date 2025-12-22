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
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });

        const $ = cheerio.load(response.data);

        // 1. Better user existence check
        const pageTitle = $('title').text();
        if (pageTitle.includes('Error Page') || 
            pageTitle.includes('Not Found') ||
            $('.m-content-html').text().includes('could not be found')) {
            return null;
        }

        // 2. Extract Rating - multiple selectors for reliability
        let rating = 0;
        const ratingSelectors = [
            '.rating-number',
            '.rating-header .rating-number',
            '.user-profile-container .rating-header .rating-number'
        ];
        
        for (const selector of ratingSelectors) {
            const ratingText = $(selector).first().text().trim();
            if (ratingText) {
                rating = parseInt(ratingText.match(/\d+/)?.[0] || 0, 10);
                if (rating > 0) break;
            }
        }

        // 3. Extract Problems Solved - multiple approaches
        let problemsSolved = 0;
        
        // Approach 1: Look for "Fully Solved" sections
        const solvedSelectors = [
            'h5:contains("Fully Solved")',
            'section.problems-solved h5:contains("Fully Solved")',
            'div.content h5:contains("Fully Solved")'
        ];
        
        for (const selector of solvedSelectors) {
            const solvedText = $(selector).text();
            const solvedMatch = solvedText.match(/\((\d+)\)/);
            if (solvedMatch) {
                problemsSolved = parseInt(solvedMatch[1], 10);
                break;
            }
        }
        
        // Approach 2: If Approach 1 fails, try to count from the problems list
        if (problemsSolved === 0) {
            const problemLinks = $('a[href*="/problems/"]');
            const solvedProblems = problemLinks.filter((i, el) => {
                const href = $(el).attr('href');
                return href && href.includes('/problems/') && href.includes('status=');
            }).length;
            problemsSolved = Math.max(problemsSolved, solvedProblems / 2); // Approximate
        }

        // 4. Extract Global Rank - improved selector
        let globalRank = 0;
        const rankSelectors = [
            '.rating-ranks .inline-list li:first-child a strong',
            '.rating-ranks ul li:first-child a strong',
            'a[href*="/ratings/all"] strong'
        ];
        
        for (const selector of rankSelectors) {
            const rankText = $(selector).text().replace(/,/g, '').trim();
            if (rankText && !isNaN(rankText)) {
                globalRank = parseInt(rankText, 10);
                if (globalRank > 0) break;
            }
        }

        // 5. Extract Stars/Rating Category
        let stars = '0★';
        const starsText = $('.rating-star').text() || $('.rating').text();
        const starsMatch = starsText.match(/(\d+)\s*★/);
        if (starsMatch) {
            stars = `${starsMatch[1]}★`;
        }

        // 6. Extract Highest Rating
        let highestRating = rating;
        const highestRatingText = $('small:contains("Highest Rating")').text();
        const highestMatch = highestRatingText.match(/(\d+)/);
        if (highestMatch) {
            highestRating = parseInt(highestMatch[1], 10);
        }

        return { 
            handle: cleanUser,
            rating,
            highestRating,
            stars,
            globalRank,
            problemsSolved,
            profileUrl: url,
            fetchedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error("CodeChef Fetch Error:", error.message);
        
        // More detailed error logging
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`URL: ${error.config.url}`);
        }
        
        return null;
    }
}

// Test function
async function testFetch() {
    console.log("Testing CodeChef fetcher...");
    
    const testUsers = ['tourist', 'gennady.korotkevich', 'fakeuser123456789'];
    
    for (const user of testUsers) {
        console.log(`\nFetching ${user}...`);
        const result = await fetchCodeChef(user);
        
        if (result) {
            console.log(`Success!`, {
                handle: result.handle,
                rating: result.rating,
                problemsSolved: result.problemsSolved,
                globalRank: result.globalRank
            });
        } else {
            console.log(`User ${user} not found or error occurred`);
        }
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// Uncomment to test
// testFetch();

module.exports = { fetchCodeChef };
