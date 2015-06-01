var R = require('ramda');

function respondComplete(res) {
  'use strict';
  res.writeHead(200, {'content-type': 'application/json'});
  res.end(JSON.stringify({
    status: 'complete'
  }));
}

function respondMissing(res, missing) {
  'use strict';

  res.writeHead(400, {'content-type': 'application/json'});
  res.end(JSON.stringify({
    status: 'missing_fields',
    missing: missing
  }));
}

module.exports = {
  complete: respondComplete,
  missing: respondMissing
};