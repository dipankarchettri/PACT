const axios = require('axios');
const cheerio = require('cheerio');

async function testLinkedInScraping() {
    // A known public profile
    const url = 'https://www.linkedin.com/in/williamhgates'; 
    
    try {
        console.log(`Fetching ${url}...`);
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        const $ = cheerio.load(data);
        
        // Try to find og:image
        const ogImage = $('meta[property="og:image"]').attr('content');
        const title = $('title').text();
        
        console.log('Page Title:', title);
        console.log('OG Image:', ogImage);
        
        if (ogImage && !ogImage.includes('ghost')) {
            console.log('SUCCESS: Found profile image!');
        } else {
            console.log('FAILED: No valid profile image found.');
        }

    } catch (error) {
        console.error('Error fetching LinkedIn:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data peak:', error.response.data.substring(0, 200));
        }
    }
}

testLinkedInScraping();
