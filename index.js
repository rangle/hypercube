var config = require('./config');

var express = require('express');
var app = express();
var formidable = require('formidable');

var handlers = require('./handlers');

app.post('/upload', handlers.upload);

app.set('port', process.env.PORT || config.port);
app.listen(config.port);
