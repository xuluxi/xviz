import {XVIZFormatter} from '../sinks/websocket-sink';
import {XVIZData} from '../sources/xviz-data';

// TODO: who is responsible for the envelop?
// .. clearly not this
// ... need class to "construct" messages.
// in @xviz/io
export class XVIZWebsocketSender {
  constructor(socket, options) {
    this.socket = socket;
    // TODO: options register:
    // - compress
    // - formatter
    this.options = options;
  };

  _getOpts(resp) {
    let opts = {compress: false};
    if (typeof resp  === 'string') {
      opts.compress = true;
    }

    return opts;
  }

  onStart(req, msg) {
    const resp = XVIZFormatter(msg.data, this.options);
    this.socket.send(resp, this._getOpts(resp));
    // this.socket.send(JSON.stringify({ type: 'xviz/metadata', data: msg.data}));
  }

  onStateUpdate(req, msg) {
    const resp = XVIZFormatter(msg.data, this.options);
    this.socket.send(resp, this._getOpts(resp));
  }

  onTransformLogDone(req, msg) {
    const resp = JSON.stringify({ type: 'xviz/transform_log_done', data: msg});
    this.socket.send(resp, this._getOpts(resp));
  }
}
