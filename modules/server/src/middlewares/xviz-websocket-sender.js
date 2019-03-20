import {
  XVIZData,
  XVIZFormatter
} from '@xviz/io';

// TODO: who is responsible for the envelop?
// .. clearly not this
// ... need class to "construct" messages.
// in @xviz/io
export class XVIZWebsocketSender {
  constructor(context, socket, options) {
    this.context = context;
    this.socket = socket;
    // TODO: options register:
    // - compress
    // - formatter
   
    this.options = options;
    // Websocket needs string or buffer 
    // TODO: should this throw instead
    if (this.options.format === 'object') {
      this.options.format = 'json_string';
    }
  };

  _getFormatOptions(msg) {
    // desire natural pass-thru
    if (!this.options.format) {
      // if has message, xvizformatter will convert
      // so, string and arraybuffers can go thru
      // anything else needs a change
      if (!msg.data.hasMessage() &&
          typeof msg.data.buffer === 'string' &&
          !msg.data.buffer.byteLength)
      {
        console.log('sending string');
        return {...this.options, format: 'json_string'};
      }
    }

    return this.options;
  }

  _getOpts(resp) {
    let opts = {compress: false};
    if (typeof resp  === 'string') {
      opts.compress = true;
    }

    return opts;
  }

  onError(req, msg) {
    // TODO: doesn't really make sense to send this as binary
    const resp = JSON.stringify(msg);
    console.log(msg);
    this.socket.send(resp, this._getOpts(resp));
  }

  onMetadata(req, msg) {
    // msg: XVIZData
    const resp = XVIZFormatter(msg.data, this._getFormatOptions(msg));
    this.socket.send(resp, this._getOpts(resp));
    // this.socket.send(JSON.stringify({ type: 'xviz/metadata', data: msg.data}));
  }

  onStateUpdate(req, msg) {
    // msg: XVIZData
    const resp = XVIZFormatter(msg.data, this._getFormatOptions(msg));
    this.socket.send(resp, this._getOpts(resp));
  }

  onTransformLogDone(req, msg) {
    const resp = JSON.stringify(msg);
    this.socket.send(resp, this._getOpts(resp));
  }
}
