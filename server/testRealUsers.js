const { fetchCodeChef } = require('./src/utils/codechef');
const { fetchGeeksForGeeks } = require('./src/utils/scrapers');

(async () => {
    // Test CodeChef
    const ccData = await fetchCodeChef('gennady.korotkevich');
    console.log("CodeChef Tourust Data:", ccData);

    // Test GFG
    const gfgData = await fetchGeeksForGeeks('sandeep.jain');
    console.log("GFG Sandeep Data:", gfgData);
})();
