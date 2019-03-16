import {makeJSONDataSource} from './xviz-json-data-source';
import {makeBinaryDataSource} from './xviz-binary-data-source';

export class XVIZSourceFactory {
  static open(root, path, params) {
    let source = makeJSONDataSource(root, path, params);
    if (!source) {
      source = makeBinaryDataSource(root, path, params);
    }

    if (source) {
      return source;
    }

    return null;
  }
}

/*
 dataRequestContext
  options
    delay
    binary|json
  
  dataResponseContext
    socket
    xvizdatasource

    timestamp
    index
    sendInterval

  sendResponse(drc)
    this.activeResponse = dataResponseContext
    this.activeInterval
 */

export class XVIZSource {
  constructor(root, options, log) {
    this.root = root;
    this.options = options;

      

    // middleware stack options
    // verify
    // validate
    
    // load timing index || fetch index
    // verify metadata
    // verify frames
  }

  onConnection() {
  }

  // Requests
  onStart(data) {
    // send metadata

    // version
    // profile
    // message_format json|binary
    // session_type log|live
    // log

    // version unsupported
    // profile unknown
    // format unsupported
    // session_type unknown
    // log not found
  }

  onMetadata(data) {
  }

  onTransformLog(data) {
    // send state_updates

    // id
    // start_timestamp
    // end_timestamp
    // desired_streams []
  
    // clamped timestamp

    // time range not valid
  }

  onTransformPointInTime(data) {
    // send state_updates
 
    // id
    // query_timestamp
    // desired_streams []
  
    // timestamp not valid
  }

  onReconfigure(data) {
    // update_type delta|full
    // config_update: {}

  }

  //
  _sendData() {
    // delay
  }
}
