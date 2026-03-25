const fs = require('fs');
const cheerio = require('cheerio');

// Parse CodeChef
const ccHtml = fs.readFileSync('cc.html', 'utf-8');
const $cc = cheerio.load(ccHtml);

let out = "=== CodeChef ===\n";
out += "Title: " + $cc('title').text() + "\n";
out += "Rating Number text: " + $cc('.rating-number').text() + "\n";
out += "Rating Ranks text: " + $cc('.rating-ranks').text() + "\n";
out += "Stars text: " + $cc('.rating-star').text() + "\n";
out += "All H1-H6 tags: " + $cc('h1, h2, h3, h4, h5, h6').map((i, el) => $cc(el).text()).get().join(' | ') + "\n";
out += "Any div with rating: " + $cc('div').filter((i, el) => $cc(el).attr('class') && $cc(el).attr('class').includes('rating')).map((i, el) => $cc(el).attr('class')).get().slice(0, 10) + "\n";

// Parse GFG
const gfgHtml = fs.readFileSync('gfg.html', 'utf-8');
const $gfg = cheerio.load(gfgHtml);

out += "\n=== GeeksForGeeks ===\n";
out += "Title: " + $gfg('title').text() + "\n";
const allGfgText = $gfg('body').text();
const scoreMatch = allGfgText.match(/(score|rank|solved|Overall Coding Score).*?\d+/gi) || [];
out += "Score Matches: " + scoreMatch.slice(0, 15).join(', ') + "\n";

fs.writeFileSync('testOutput.txt', out, 'utf-8');
