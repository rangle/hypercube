var config = require('../../config');

var R = require('ramda');
var fs = require('fs');

var move = require('./move');
var mkOutPath = require('./out-path');

function makeVersionJSON(ch) {
  'use strict';
  return JSON.stringify({
    version: ch
  });
}

function writeOut (stf, cb) {
  var outPath = mkOutPath(stf);
  move(stf.files.js.path,
       config.uploadPath + outPath + '/app.js');
  move(stf.files.css.path,
       config.uploadPath + outPath + '/app.css');

  fs.unlink(config.uploadPath + outPath + '/version.json', function () {
    fs.writeFile(config.uploadPath + outPath + '/version.json', makeVersionJSON(stf.fields.commit), cb);
  });
}

module.exports = R.curry(writeOut);
