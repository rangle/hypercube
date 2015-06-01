var config = require('../../config');

var R = require('ramda');
var fs = require('fs');

var mkOutPath = require('./out-path');

function complementBy(field, collection, build) {
  return R.filter(function (v) {
           return !(v[field] === build[field]);
         }, collection);
}

module.exports = function updateVersions(stf) {
  'use strict';
  var outPath = mkOutPath(stf);

  fs.readFile(config.uploadPath + '/versions.json', function(err, data) {
    if(err) {
      throw err;
    }

    var versions = JSON.parse(data);
    var time = new Date().toISOString();

    var build = {
      branch: stf.fields.branch,
      timestamp: time,
      commit: stf.fields.commit,
      path: outPath,
      pr: stf.fields.pr
    };

    // Remove existing references to the branch
    versions.branches = complementBy('branch', versions.branches, build);
    versions.branches.push(build);

    // Remove existing references to the commit, just in case.
    versions.commits = complementBy('commit', versions.commits, build);
    versions.commits.push(build);

    if(build.pr) {
      // Remove existing references to the pr
      versions.prs = complementBy('pr', versions.prs, build);
      versions.prs.push(build);
    }

    fs.writeFile(config.uploadPath + '/versions.json', JSON.stringify(versions), function(err) {
      if(err) {
        throw err;
      }
    });
  });
};