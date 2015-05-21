var config = require('../config');
var R = require('ramda');

var util = require('util');

var fs = require('fs');
var path = require('path');

var formidable = require('formidable');

var necessary_fields = [
  ['fields', 'commit'],
  ['files', 'js'],
  ['files', 'css']
];

var formatPath = R.join(':');

var respondMissing = function(res, missing) {
  'use strict';
  var formatted = R.map(formatPath, missing);

  res.writeHead(400);
  res.end('Bad request, missing: ' +
          formatted.join(', '));
};

module.exports = function (req, res) {
  'use strict';
  var form = new formidable.IncomingForm();


  form.parse(req, function(err, fields, files) {
    if(err) {
      throw err;
    }
    var outPath;
    var versionJSON;
    var stf = {
      fields: fields,
      files: files
    };

    var missing_fields = R.reduce(function (a, x) {
      if(!R.path(x, stf)) {
        return a.concat([x]);
      }
      return a;
    }, [], necessary_fields);

    if(missing_fields.length > 0) {
      respondMissing(res, missing_fields);
    } else {
      versionJSON = makeVersionJSON(fields.commit);
      if(~~fields.pr) {
        outPath = '/pr/' + ~~fields.pr;
      } else if(fields.branch) {
        outPath = '/branch/' + fields.branch;
      } else {
        missing_fields.concat([['fields', 'pr']]);
        respondMissing(res, missing_fields);
      }

      fs.exists(config.uploadPath + outPath, handlePathExists);
    }

    function updateManifest () {
      fs.readFile(config.uploadPath + '/manifest.json', function(err, data) {
        if(err) {
          throw err;
        }
        var manifest = JSON.parse(data);
        var time = new Date().toISOString();
        // Clear other timestamp references to the same output path
        for(var each in manifest.by.timestamp) {
          if(manifest.by.timestamp[each] === outPath) {
            manifest.by.timestamp[each] = undefined;
          }
        }
        manifest.by.timestamp[time] = outPath;

        if(~~fields.pr) {
          manifest.by.pr[~~fields.pr] = outPath;
        } else if(fields.branch) {
          manifest.by.branch[fields.branch] = outPath;
        }
        fs.writeFile(config.uploadPath + '/manifest.json', JSON.stringify(manifest), function(err) {
          if(err) {
            throw err;
          }
        });
      });
    }

    function handlePathExists (exists) {
      if(exists) {
        writeOut();
      } else {
        fs.mkdir(config.uploadPath + outPath, writeOut);
      }
    }

    function writeOut () {
      moveProper(files.js.path,
                 config.uploadPath + outPath + '/app.js');
      moveProper(files.css.path,
                 config.uploadPath + outPath + '/app.css');

      fs.unlink(config.uploadPath + outPath + '/version.json', function () {
        fs.writeFile(config.uploadPath + outPath + '/version.json', versionJSON, function(e) {
          if (e) {
            console.error('Performing harakiri...');
          } else {
            updateManifest();
            complete(res);
          }
        });
      });
    }
  });
};

// Do this because /tmp is likely to be on tmpfs,
// which cannot be properly moved with fs.rename
function moveProper(infile, outfile) {
  'use strict';
  var read = fs.createReadStream(infile);
  var write = fs.createWriteStream(outfile);


  read.on('end', function() {
    write.end();
    fs.unlink(infile, function(e) {
      if (e) {
        throw e;
      }
    });
  });

  read.pipe(write);
}

function complete(res) {
  'use strict';
  res.writeHead(200, {'content-type': 'text/plain'});
  res.end('Great success!\n');
}

function makeVersionJSON(ch) {
  'use strict';
  return JSON.stringify({
    version: ch
  });
}
