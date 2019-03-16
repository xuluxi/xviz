import tape from 'tape-catch';

import {XVIZServer} from '@xviz/server';

/*
 * server
 *  options
 *    port
 *    payloadSize
 *    route
 *
 *    path/params
 *
 *  factory/source
 *    source need to mock file access
 *    minimal need for server testing
 *
 * server connection -> handler
 *  socket, source, middleware
 *  middle ware based on options
 *
 *
 * accept connection message, process message
 *  # how to subclass and handle your own message
 *
 *  # move to a handler, so you can have message handlers
 *  
 */

tape.skip('XVIZServer#constructor', t => {
  const wss1 = new XVIZServer({ port: 0 }, () => {
    const wss2 = new WebSocket.Server({
      port: wss1.address().port
    });

    // t.equal(xvizObj.dataType(), test.dataType, `data as ${test.name} has expected dataType`);
    wss2.on('error', () => wss1.close(done));
  });
  t.end();
});
