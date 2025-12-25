const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape LinkedIn public profile image
 * @param {string} linkedinUrl - Full LinkedIn profile URL
 * @returns {Promise<string|null>} URL of the profile image or null
 */
async function fetchLinkedInImage(linkedinUrl) {
    if (!linkedinUrl) return null;

    try {
        // Basic validation
        if (!linkedinUrl.includes('linkedin.com/in/')) {
            console.log('[LinkedIn Scraper] Invalid URL format:', linkedinUrl);
            return null;
        }

        const { data } = await axios.get(linkedinUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 15000 // 15s timeout
        });

        const $ = cheerio.load(data);
        
        // LinkedIn public profiles often use og:image for the profile picture
        const ogImage = $('meta[property="og:image"]').attr('content');
        
        // Filter out default "ghost" images if possible (LinkedIn sometimes serves a generic one)
        // The ghost image usually contains specific patterns, but checking if it exists is a good start.
        
        if (ogImage && !ogImage.includes('ghost') && !ogImage.includes('login')) {
            console.log(`[LinkedIn Scraper] Found image for ${linkedinUrl}`);
            return ogImage;
        }

        return null;

    } catch (error) {
        console.error(`[LinkedIn Scraper] Error fetching ${linkedinUrl}:`, error.message);
        // Don't crash the flow, just return null
        return null;
    }
}

module.exports = {
    fetchLinkedInImage
};
