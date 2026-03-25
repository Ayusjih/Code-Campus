const fs = require('fs');
const axios = require('axios');

(async () => {
    try {
        const ccRes = await axios.get('https://www.codechef.com/users/tourist', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        fs.writeFileSync('cc.html', ccRes.data);

        const gfgRes = await axios.get('https://www.geeksforgeeks.org/user/sandeep.jain/', {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        fs.writeFileSync('gfg.html', gfgRes.data);
        console.log("HTML downloaded successfully");
    } catch (e) {
        console.error(e);
    }
})();
