var config = require('./config');

var fs = require('fs');

var express = require('express');
var app = express();
var formidable = require('formidable');

var handlers = require('./handlers');

app.post('/upload', handlers.upload);

app.set('port', process.env.PORT || config.port);
app.listen(config.port);

assureDir(config.uploadPath + '/commit');
assureVersions();

function assureDir(dir) {
  fs.exists(dir, function(exists) {
    if(!exists) {
      fs.mkdir(dir, function(e) {
        if(e) {
          console.error('Could not create ' + dir + ',\n check config.js to make sure your uploadPath property is set to a path that you own.');
          throw e;
        }
      });
    }
  });
}

function assureVersions() {
  var file = config.uploadPath + '/versions.json';
  fs.exists(file, function(exists) {
    if(!exists) {
      fs.open(file, 'w', function(e, fd) {
        if(e) {
          console.error('Could not open ' + file + ' for writing,\n check config.js to make sure your uploadPath property is set to a path that you own.');
          throw e;
        } else {
          var data = JSON.stringify({
            prs: [],
            branches: [],
            commits: []
          });
          fs.write(fd, data, function(e) {
            if(e) {
              console.error('Could not write default structure to ' + file + ',\n check config.js to make sure your uploadPath property is set to a path that you own.');
              throw e;
            }
          });
        }
      });
    }
  });
}