const {resolve} = require('path');

module.exports = {
  'test-data': resolve(__dirname, 'test/data'),
  '@xviz/builder': resolve(__dirname, 'modules/builder/src'),
  '@xviz/cli': resolve(__dirname, 'modules/cli/src'),
  '@xviz/conformance': resolve(__dirname, 'modules/conformance'),
  '@xviz/io': resolve(__dirname, 'modules/io/src'),
  '@xviz/parser': resolve(__dirname, 'modules/parser/src'),
  '@xviz/schema/dist': resolve(__dirname, 'modules/schema/dist'),
  '@xviz/schema': resolve(__dirname, 'modules/schema/src'),
  '@xviz/server': resolve(__dirname, 'modules/server/src')
};
