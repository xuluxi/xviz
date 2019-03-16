import {XVIZData} from '../sources/xviz-data';
const process = require('process');
const startTime = process.hrtime();
const NS_PER_SEC = 1e9;

// Return time in milliseconds since
// argument or startTime of process.
function deltaTimeMs(startT) {
  const diff = process.hrtime(startT || startTime);
  return ((diff[0] * NS_PER_SEC + diff[1]) / 1e6).toFixed(3);
}

const DEFAULT_OPTIONS = {
  delay: 50
};

/**
 * Server middleware that handles the logic of responding
 * to a request with data from a source, processing
 * the data through the middleware
 */
export class XVIZRequestHandler {
  constructor(socket, source, middleware, options = {}) {
    this.socket = socket;
    this.source = source;
    this.middleware = middleware;

    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    console.log(`ReqHandler ${JSON.stringify(options, null, 2)}`);

    this.interval = null;
    this.inflight = null;
    this.default_inflight = {
      startIndex: 2,
      endIndex: 6,
      index: 2
    };

    this.t_start_time = 0;
  };

  onStart(req, msg) {
    console.log(`~~onStart`);
    const md = this.source.xvizMetadata();
    msg.data = md;
  }

  onTransformLog(req, msg) {
    console.log(`~~onTransformLog: ${JSON.stringify(msg)}`);
    if (this.interval === null) {
      this.inflight = {...this.default_inflight};
      this.inflight.id = msg.id;

      this.t_start_time = process.hrtime();
      if (this.options.delay < 1) {
        console.log('send all frames');
        this._sendAllStateUpdates(this.inflight);
      } else {
        this._sendStateUpdate(this.inflight);
      }
    }
  }

  _sendStateUpdate(req) {
    console.log(`~~onStateUpdate: ${req.index}`);
    const frame_sent_start_time = process.hrtime();

    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }

    if (req.index > req.endIndex) {
      this.middleware.onTransformLogDone({}, new XVIZData({id: this.inflight.id}));
      this.inflight = null;
    } else {
      const index = req.index;
      req.index += 1;


      const loadtime = process.hrtime();
      const data = this.source.xvizFrameByIndex(index);
      const dataload = deltaTimeMs(loadtime);
      console.log('~~~ req: ', data instanceof XVIZData);
      console.log(`--- loadtime ${dataload}`);

      const sendtime = process.hrtime();
      this.middleware.onStateUpdate({}, {data});
      const datasend = deltaTimeMs(sendtime);
      console.log(`--- sendtime ${datasend}`);

      this.interval = setTimeout(() => this._sendStateUpdate(this.inflight), this.options.delay);

      const frame_sent_end_time = process.hrtime();
      this.logMsgSent(frame_sent_start_time, frame_sent_end_time, index);
    }
  }

  _sendAllStateUpdates(req) {
    const index = req.index;
    for (let i = req.index; i <= req.endIndex; i++) {
      console.log(`~~onStateUpdate: ${i}`);
      const frame_sent_start_time = process.hrtime();

      const data = this.source.xvizFrameByIndex(index);
      console.log('~~~ req: ', data instanceof XVIZData);
      this.middleware.onStateUpdate({}, {data});

      const frame_sent_end_time = process.hrtime();

      this.logMsgSent(frame_sent_start_time, frame_sent_end_time, i);
    }

    // TODO: middleware should take {data: XVIZData}
    this.middleware.onTransformLogDone({}, new XVIZData({id: this.inflight.id}));
    this.inflight = null;
  }

  logMsgSent(start_time, end_time, index) {
    const t_from_start_ms = deltaTimeMs(this.t_start_time);
    const t_msg_start_time_ms = deltaTimeMs(start_time);
    const t_msg_end_time_ms = deltaTimeMs(end_time);
    console.log(
      `[< STATE_UPDATE] ${index}): ${t_msg_start_time_ms}ms ${t_msg_end_time_ms}ms start: ${t_from_start_ms}ms`
    );
  }
}
