let path = require('path');

// This should be only for the executable?
// in a bin/* script
require('@babel/register')({
  configFile: path.resolve(__dirname, '../../../babel.config.js'),
  ignore: []
});

const ALIASES = require('../../../aliases');
const moduleAlias = require('module-alias');
moduleAlias.addAliases(ALIASES);

// TODO: this needs split to other bits to collect
// args or not?
const setupArgs = require('./args').setupArgs;

const XVIZSourceFactory = require('./sources').XVIZSourceFactory;
const XVIZSession = require('./server/xviz-session').XVIZSession;
const XVIZServer = require('./server/server').XVIZServer;
  
function main() {
  const args = setupArgs();
  
  const options = {
    ...args.argv
  };

  if (Number.isFinite(args.argv.delay)) {
    options.delay = args.argv.delay;
  }

  const xvizSession = new XVIZSession(XVIZSourceFactory, options);

  const wss = new XVIZServer(
    [xvizSession],
    options,
    () => {
      console.log(`~~XVIZ Server listening on port ${wss.server.address().port}`);
    });
} 

main();
