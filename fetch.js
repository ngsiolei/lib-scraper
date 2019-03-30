'use strict';

const https = require('https');
const fs = require('fs');

const fetchSearchResults = (q, cb) => {
  const options = {
    hostname: 'webpac.library.gov.mo',
    port: 443,
    path: `/client/rss/hitlist/webpac/qu=${encodeURIComponent(q)}`,
    method: 'GET',
  };
  const req = https.request(options, res => {
    let content = '';
    res.on('data', d => {
      content += d;
    });
    res.on('end', () => {
      cb(null, content);
    });
  });

  req.on('error', err => {
    console.error(err);
    cb(err);
  });

  req.end();
};

const fetchLocal = (filename, cb) => {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, data);
  });
};

module.exports = {
  fetchSearchResults,
  fetchLocal,
};
