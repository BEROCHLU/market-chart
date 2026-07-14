const fs = require('fs');
const path = require('path');
const tickers = require('./ticker-source');

// Normalize symbols and keep the generated select list alphabetically ordered.
const sortedTickers = tickers
    .map((ticker) => ticker.toUpperCase())
    .sort();

// Write an ES module consumed directly by the browser.
const output = `export const arrTicker = ${JSON.stringify(sortedTickers, null, '\t')};`;
const outputPath = path.join(__dirname, '..', 'public', 'static', 'list.js');

fs.writeFileSync(outputPath, output);
