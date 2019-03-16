const yargs = require('yargs');

export function setupArgs() {
  const args = yargs.alias('h', 'help');

  // client can request
  args.options('format', {
    describe: 'output data could be json, json_buffer, binary'
  });

  args.options('live', {
    describe: 'Setup server and data to behave like a live system',
    boolean: true
  });

  args.options('loop', {
    describe: 'Setup server and data to behave like a live system',
  });

  args.options('duration', {
    describe: 'Setup server and data to behave like a live system',
  });

  args.options('limit', {
    describe: 'Setup server and data to behave like a live system',
  });

  // --delay [50]
  // --d
  // --port [3000]
  // --validate

  // stream filters
  // --include 
  // --exclude
  //
  // preload [true]

  return args;
}


