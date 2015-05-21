var config = require('./config');

var fs = require('fs');

var express = require('express');
var app = express();
var formidable = require('formidable');

var handlers = require('./handlers');

app.post('/upload', handlers.upload);

app.set('port', process.env.PORT || config.port);
app.listen(config.port);

assureDir(config.uploadPath + '/pr');
assureDir(config.uploadPath + '/branch');

function assureDir(dir) {
  fs.exists(dir, function(exists) {
    if(!exists) {
      fs.mkdir(dir, function(e) {
        if(e) {
          console.error('Could not create' + dir + ', check config.js to make sure your uploadPath property is set to a path that you own.');
          throw e;
        }
      });
    }
  });
}