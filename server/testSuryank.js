const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
    try {
        const ccRes = await axios.get('https://www.codechef.com/users/suryanks21', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $cc = cheerio.load(ccRes.data);
        console.log("=== CodeChef suryanks21 ===");
        console.log("Title: ", $cc('title').text());
        console.log("Rating Number text: ", $cc('.rating-number').text());
        console.log("All H1-H6 tags: ", $cc('h1, h2, h3, h4, h5, h6').map((i, el) => $cc(el).text()).get().join(' | '));
        console.log("Total problems match:", $cc('body').text().match(/Total Problems Solved:\s*(\d+)/i));
        
        // Let's dump the Drupal.settings object if any
        const scripts = $cc('script').map((i, el) => $cc(el).html()).get();
        const drupalScript = scripts.find(s => s && s.includes('Drupal.settings'));
        if (drupalScript) {
             console.log("Found Drupal settings!");
             const match = drupalScript.match(/"rating"\s*:\s*"(\d+)"/i);
             if (match) console.log("Rating inside settings:", match[1]);
        }
    } catch (e) {
        console.error(e.message);
    }
})();
