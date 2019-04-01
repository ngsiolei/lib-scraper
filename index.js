'use strict';

const t1 = Date.now();
const args = process.argv;
if (args.length < 3) {
  console.log('Usage: node index QUERY');
  process.exit(1);
}

const q = args.slice(2).join(' ');

const {fetchSearchResults, fetchLocal} = require('./fetch.js');
const {parseSearchResults} = require('./parse.js');

fetchSearchResults(q, (err, results) => {
  if (err) {
    console.error(err);
    return;
  }
  parseSearchResults(results, (err, items) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('---');
    items.forEach(x => {
      const link = `https://webpac.library.gov.mo/client/zh_TW/webpac/search/detailnonmodal?d=${encodeURIComponent(x.id +'~~0')}`;
      console.log(['*', x.title, '|', link].join(' '));
    });
    console.log('---');
    const t2 = Date.now();
    console.log(`Counts: ${items.length} (${t2 - t1}ms)`);
  });
});
