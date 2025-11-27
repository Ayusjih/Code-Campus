const axios = require('axios');

async function fetchCodeChefStats(username) {
    try {
        // 1. Username clean karo
        const cleanUser = username.replace('@', '').trim();

        const url = `https://www.codechef.com/users/${cleanUser}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = response.data;

        // 2. Check karo ki user exist karta hai ya nahi (Title check)
        if (html.includes("New to CodeChef?")) {
             // Ye text tab aata hai jab user nahi milta
             console.log(`❌ CodeChef User ${cleanUser} not found`);
             return null;
        }

        // 3. Rating dhoondo
        const ratingMatch = html.match(/<div class="rating-number">(\d+)<\/div>/);
        
        if (ratingMatch && ratingMatch[1]) {
            const rating = parseInt(ratingMatch[1], 10);
            console.log(`✅ CodeChef ${cleanUser}: Rating=${rating}`);
            return { rating };
        }

        // 4. Agar Rating Number nahi mila, par page load hua -> Matlab User Unrated hai (0 Rating)
        console.log(`⚠️ CodeChef User ${cleanUser} found but UNRATED (0).`);
        return { rating: 0 };

    } catch (error) {
        console.error("❌ CodeChef Fetch Error:", error.message);
        return null;
    }
}

module.exports = fetchCodeChefStats;