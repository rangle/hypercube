var config = require('../../config');

var R = require('ramda');
var util = require('util');
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');

var verify = require('./verify');
var respond = require('./respond');
var updateVersions = require('./update-versions');
var writeOut = require('./write-out');
var mkOutPath = require('./out-path');

module.exports = function (req, res) {
  'use strict';
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    if(err) {
      throw err;
    }

    var stf = {
      fields: fields,
      files: files
    };
    var outPath = mkOutPath(stf);

    var missing_fields = verify.missing(stf);

    if(missing_fields.length > 0) {
      respond.missing(res, missing_fields);
    } else {
      fs.exists(config.uploadPath + outPath, handlePathExists);
    }

    function handlePathExists (exists) {
      if(exists) {
        writeOut(stf, function(e) {
          if (e) {
            console.error('Performing harakiri...');
          } else {
            updateVersions(stf);
            respond.complete(res);
          }
        });
      } else {
        fs.mkdir(config.uploadPath + outPath, writeOut(stf));
      }
    }
  });
};
