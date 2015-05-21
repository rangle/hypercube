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
        outPath = config.uploadPath +
          '/pr/' + ~~fields.pr;
      } else if(fields.branch) {
        outPath = config.uploadPath +
          '/branch/' + fields.branch;
      } else {
        missing_fields.concat([['fields', 'pr']]);
        respondMissing(res, missing_fields);
      }

      fs.exists(outPath, handlePathExists);
    }

    function handlePathExists (exists) {
      if(exists) {
        writeOut();
      } else {
        fs.mkdir(outPath, writeOut);
      }
    }

    function writeOut () {
      moveProper(files.js.path,
                 outPath + '/app.js');
      moveProper(files.css.path,
                 outPath + '/app.css');

      fs.unlink(outPath + '/version.json', function () {
        fs.writeFile(outPath + '/version.json', versionJSON, function(e) {
          if (e) {
            console.error('Performing harakiri...');
          } else {
            complete(res, outPath);
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
