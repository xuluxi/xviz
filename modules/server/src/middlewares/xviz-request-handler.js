import {XVIZData} from '@xviz/io';
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

function ErrorMsg(message) {
  return { type: 'xviz/error', data: {message}};
}

function TransformLogDoneMsg(msg) {
  return { type: 'xviz/transform_log_done', data: msg};
}

function backfillWithDefault(obj, defaultObj) {
  console.log(obj);
  Object.getOwnPropertyNames(defaultObj).forEach(key => {
    if (!obj.key) {
      obj.key = defaultObj.key;
    }
  });

  return obj;
}

const startMsgDefault = {
  // version
  // profile
  message_format: 'binary',
  session_type: 'log'
  //log {}
};

/**
 * Server middleware that handles the logic of responding
 * to a request with data from a source, processing
 * the data through the supplied middleware
 */
export class XVIZRequestHandler {
  constructor(context, socket, source, middleware, options = {}) {
    this.context = context;
    this.socket = socket;
    this.source = source;
    this.middleware = middleware;

    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

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
    console.log(msg);
    if (!req.version || !/^2\.*/.test(req.version)) {
      console.log('xviz onstart bad version');
      const message = `Error: Version '${req.version}' is unsupported`;
      this.middleware.onError(req, ErrorMsg(message));
    } else {
      console.log('xviz onstart good version');
      this.context.start = backfillWithDefault(req, startMsgDefault);
      
      // Errors
      // ? some of these are dependent on the source/session
      //   can only be reported once transform log is specified
      //
      // version unsupported
      // profile unknown
      // format unsupported
      // session_type unknown
      // log not found

      // send metadata
      const data = this.source.xvizMetadata();
      this.middleware.onMetadata(req, {data});
    }
  }

  onTransformLog(req, msg) {
    if (!req.id) {
      const message = `Error: Missing 'id' from transform_log request`;
      this.middleware.onError(req, ErrorMsg(message));
    } else {
      this.context.transformLog = req;
      // id
      // start_timestamp
      // end_timestamp
      // desired_streams []
    
      // clamped timestamp
      // time range not valid

      if (this.interval === null) {
        const frameRange = this.source.getFrameRange(req.start_timestamps, req.end_timestamps);
        // TODO: what if out of range, or default
        // I say default is defined by source
        // but we should have guidance
        this.context.inflight = {
          id: req.id,
          startIndex: frameRange.start,
          endIndex: frameRange.end,
          index: frameRange.start
        };

        // send state_updates || error
        this.t_start_time = process.hrtime();
        if (this.options.delay < 1) {
          this._sendAllStateUpdates(this.context.inflight);
        } else {
          this._sendStateUpdate(this.context.inflight);
        }
      }
    }
  }

  _sendStateUpdate(req) {
    const frame_sent_start_time = process.hrtime();

    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }

    if (req.index > req.endIndex) {
      // TODO: need A XVIZData.TransformLogDone(msg);, because XVIZData is the expected pass
      // Could have XVIZData constructor that takes format + object and prepopulates the message?
      this.middleware.onTransformLogDone(req.request, TransformLogDoneMsg({id: req.id}));

      // TODO? this inflight seems odd, seems req could have a 'done()' call maybe
      this.context.inflight = null;
    } else {
      const index = req.index;
      req.index += 1;


      const loadtime = process.hrtime();
      const data = this.source.xvizFrameByIndex(index);
      const dataload = deltaTimeMs(loadtime);
      console.log(`--- loadtime ${dataload}`);

      const sendtime = process.hrtime();
      this.middleware.onStateUpdate(req, {data});
      const datasend = deltaTimeMs(sendtime);
      console.log(`--- sendtime ${datasend}`);

      this.interval = setTimeout(() => this._sendStateUpdate(this.context.inflight), this.options.delay);

      const frame_sent_end_time = process.hrtime();
      this.logMsgSent(frame_sent_start_time, frame_sent_end_time, index);
    }
  }

  _sendAllStateUpdates(req) {
    const index = req.index;
    for (let i = req.index; i <= req.endIndex; i++) {
      const frame_sent_start_time = process.hrtime();

      const data = this.source.xvizFrameByIndex(index);
      this.middleware.onStateUpdate({}, {data});

      const frame_sent_end_time = process.hrtime();

      this.logMsgSent(frame_sent_start_time, frame_sent_end_time, i);
    }

    this.middleware.onTransformLogDone({}, TransformLogDoneMsg({id: this.context.inflight.id}));
    this.context.inflight = null;
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
