const scrapers = require('./src/utils/scrapers');

(async () => {
    // Test CodeChef
    const ccData = await scrapers.fetchCodeChef('suryanks21');
    console.log("CodeChef Data:", ccData);

    // Test GFG
    const gfgData = await scrapers.fetchGeeksForGeeks('suryank210');
    console.log("GFG Data:", gfgData);

    // Test Codeforces
    const cfData = await scrapers.fetchCodeforces('suryanks21');
    console.log("CodeForces Data:", cfData);
})();
