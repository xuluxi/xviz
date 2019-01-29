/**
 * Convert a single bag from command line
 *
 * Usage: npx babel-node convert-cli ~/bags/input.bag ~/output
 */
require('@babel/register');
require('babel-polyfill');

const convert = require('./lib/xviz-converter').convert;

convert({
  bag: process.argv[2],
  outputDir: process.argv[3],
  frameLimit: Number.MAX_VALUE
});
