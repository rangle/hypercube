var R = require('ramda');

var necessary_fields = [
  'commit',
  'branch'
];

function missingFields(stf) {
  'use strict';
  return R.filter(R.complement(R.prop(R.__, stf.fields)),
                  necessary_fields);
}

module.exports = {
  missing: missingFields
}