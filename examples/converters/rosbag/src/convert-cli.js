/**
 * Convert a single bag from command line
 *
 * Usage: npx babel-node convert-cli ~/bags/input.bag ~/output
 */
import 'babel-polyfill';

import {convert} from './lib/xviz-converter';

convert({
  bag: process.argv[2],
  outputDir: process.argv[3],
  frameLimit: Number.MAX_VALUE
});
