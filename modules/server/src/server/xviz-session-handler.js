// TODO: move these to @xviz/reader
import {isXVIZMessage} from '@xviz/parser';
import {XVIZData} from '../sources/xviz-data';

import {XVIZRequestHandler} from '../middlewares/xviz-request-handler';
import {XVIZWebsocketSender} from '../middlewares/xviz-websocket-sender';

// TODO: where does this live?
import {XVIZMiddlewareStack} from '../middlewares/middleware';

/*
XVIZServer is a takes sessions
  - xviz
  - kitt
  - nutonomy
  - rosbag

A session determines if it can handle a connection and if so returns a session handler

XVIZSessionHandler handles the socket and dispatching to the middleware

  anyone else can add their own session
  - Would someone want to "mix" sessions?
    - if so they just create a wrapper that if XVIZ session is happy
      they can attach to it and proxy as necessary
    - say they want to handle xvIZ data, but then want to mutate or
      add data (custom) for messages, they could try to handle first,
      else send to XVIZ

*/

export class XVIZSessionHandler {
  constructor(socket, request, source, options) {
    this.socket = socket;
    this.request = request;
    this.source = source;
    this.options = options;

    this.middleware = null;

    this._setupSocket();
    this._setupMiddleware()
  }

  _setupSocket() {
    this.socket.onerror = err => {
      this.onError(err);
    };

    this.socket.onclose = event => {
      this.onClose(event);
    };

    this.socket.onopen = () => {
      this.onOpen();
    };

    this.socket.onmessage = message => {
      this.onMessage(message);
    }
  }

  _setupMiddleware() {
    // respond to options and request
    this.middleware = new XVIZMiddlewareStack();

    const stack = [
      new XVIZRequestHandler(this.socket, this.source, this.middleware, this.options),
      new XVIZWebsocketSender(this.socket, this.options)
    ];
    this.middleware.set(stack);
  }

  onOpen() {
    console.log('Connection Open.');
  }

  onError(error) {
    console.log('Connection Error: ', error.toString());
  }

  onClose(event) {
    console.log(`Connection Close: Code ${event.code} Reason: ${event.reason}`);
  }

  onConnection() {
    console.log('~~Connection made', this.request);

    this.callMiddleware('start');
    // if live, would send metadata & stream before
    // middleware, on live would send data 
    // send metadata
    // if live sendPlayResp
  }

  onMessage(message) {
    if (isXVIZMessage(message.data)) {
      // Since this is the server we assume the message
      // we get is simple and instantiate the message immediately
      // We also need to do this to get the "type()"
      const xvizData = new XVIZData(message.data);
      console.log('~~ ', xvizData.dataFormat());
      const xvizObj = xvizData.message();
      this.callMiddleware(xvizObj.type, xvizObj.data);
    } else {
      console.log('Unknown message: ', JSON.stringify(message, null, 2).slice(0,100));
    }
  }
  
  callMiddleware(xvizType, req = {}, data = {} ) {
    switch (xvizType) {
      case 'start':
        this.middleware.onStart(req, data);
        break;
      case 'transform_log':
        this.middleware.onTransformLog(req, data);
        break;
      case 'transform_point_in_time':
        this.middleware.onTransformPointInTime(req, data);
        break;
      default:
        console.log('UNKNOWN XVIZ', xvizType, data);
        break;
    }
  }
}
