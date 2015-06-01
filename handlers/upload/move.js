var fs = require('fs');

// Do this because /tmp is likely to be on tmpfs,
// which cannot be properly moved with fs.rename
module.exports = function moveProper(infile, outfile) {
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
};
