const url = require('url');
const WebSocket = require('ws');

function getRequestData(requestUrl) {
  // find XVIZSource based request and root
  const req = url.parse(requestUrl, true);
  return {
    path: req.pathname,
    params: req.query
  };
}

const DEFAULT_OPTIONS = {
  port: 3000,
  perMessageDeflate: true,
  maxPayload: 64 * 1024 * 1024, // 64MiB
};

export class XVIZServer {
  constructor(handlers, options, callback) {
    if (!handlers) {
      throw new Error('Must specify a handler for messages');
    }

    this.handlers = handlers;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this._server = new WebSocket.Server(options, callback);

    this.server.on('connection', (socket, request) => this.handleSession(socket, request));
  }

  get server() {
    return this._server;
  }

  handleSession(socket, request) {
    console.log('~~ServerConnection made');
    const req = getRequestData(request.url);
    
    for (let handler of this.handlers) {
      const session = handler.newSession(socket, req);
      if (session) {
        session.onConnection();
        return;
      }
    }

    console.log('~~ServerConnection has no valid session');
  }
};
