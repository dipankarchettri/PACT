const { fetchGitHubStats } = require('./services/githubService');
require('dotenv').config();

async function testScraper() {
    const username = 'torvalds'; // Known user with badges
    console.log(`Fetching stats for ${username}...`);
    try {
        const stats = await fetchGitHubStats(username);
        console.log('--- GitHub Stats ---');
        console.log('Badges Found:', stats.badges?.length);
        if (stats.badges?.length > 0) {
            console.log('First Badge:', stats.badges[0]);
        }
    } catch (e) {
        console.error(e);
    }
}

testScraper();
