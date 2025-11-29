const axios = require('axios');

async function fetchLeetCodeStats(username) {
    try {
        if (!username) return null;
        
        console.log(`🔍 Fetching LeetCode stats for: ${username}`);
        const response = await axios.post('https://leetcode.com/graphql', {
            query: `
                query userProblemsSolved($username: String!) {
                    allQuestionsCount { difficulty count }
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum { difficulty count }
                        }
                    }
                }
            `,
            variables: { username }
        }, { timeout: 10000 });

        const data = response.data.data;

        if (!data.matchedUser) {
            console.log(`❌ User ${username} not found on LeetCode`);
            return null;
        }

        const stats = data.matchedUser.submitStats.acSubmissionNum;
        
        const easy = stats.find(s => s.difficulty === 'Easy')?.count || 0;
        const medium = stats.find(s => s.difficulty === 'Medium')?.count || 0;
        const hard = stats.find(s => s.difficulty === 'Hard')?.count || 0;
        const total = stats.find(s => s.difficulty === 'All')?.count || 0;

        console.log(`✅ ${username}: Easy=${easy}, Medium=${medium}, Hard=${hard}`);

        return { easy, medium, hard, total };

    } catch (error) {
        console.error("❌ Error fetching LeetCode stats:", error.message);
        return null;
    }
}

module.exports = fetchLeetCodeStats;