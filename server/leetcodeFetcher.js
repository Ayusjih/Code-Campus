// server/leetcodeFetcher.js
const axios = require('axios');

async function fetchLeetCodeStats(username) {
    try {
        // LeetCode ka Official GraphQL API Endpoint
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
        });

        const data = response.data.data;

        // Agar user nahi mila
        if (!data.matchedUser) {
            console.log(`❌ User ${username} not found on LeetCode`);
            return null;
        }

        // Data extract karo
        const stats = data.matchedUser.submitStats.acSubmissionNum;
        
        // Stats format: [ { difficulty: 'All', count: 100 }, { difficulty: 'Easy', count: 50 } ... ]
        const easy = stats.find(s => s.difficulty === 'Easy').count;
        const medium = stats.find(s => s.difficulty === 'Medium').count;
        const hard = stats.find(s => s.difficulty === 'Hard').count;

        console.log(`✅ ${username}: Easy=${easy}, Medium=${medium}, Hard=${hard}`);

        return { easy, medium, hard };

    } catch (error) {
        console.error("❌ Error fetching LeetCode stats:", error.message);
        return null;
    }
}

module.exports = fetchLeetCodeStats; 