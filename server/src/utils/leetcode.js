const axios = require('axios');

const fetchLeetCodeData = async (username) => {
    try {
        const response = await axios.post('https://leetcode.com/graphql', {
            query: `
                query getUserProfile($username: String!) {
                    matchedUser(username: $username) {
                        username
                        submitStats: submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                        profile {
                            ranking
                            reputation
                        }
                    }
                }
            `,
            variables: { username }
        });

        const data = response.data.data.matchedUser;
        
        if (!data) return null;

        // Parse the data into a clean format
        // The API returns an array like [{difficulty: 'All', count: 20}, ...]
        const totalSolved = data.submitStats.acSubmissionNum.find(s => s.difficulty === 'All').count;

        return {
            handle: data.username,
            rating: data.profile.reputation || 0, // LeetCode "Rating" is complex, using Rep as proxy or 0 for now
            globalRank: data.profile.ranking || 0,
            problemsSolved: totalSolved
        };

    } catch (error) {
        console.error('Error fetching LeetCode data:', error.message);
        return null;
    }
};

module.exports = { fetchLeetCodeData };