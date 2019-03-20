// TODO: move these to @xviz/reader
import {isEnvelope, unpackEnvelope} from '@xviz/parser';

// Represents an actual XVIZ Message
// 
// Intention is to provide dual data management
// of the XVIZ data.
// 
// If data should is passed through untouched, then
// it can be done.
//
// If data needs to be changed, it needs to be
// instantiated by calling `message()`.
//
// Care must be taken when serializing
// to use the `message()` result
export class XVIZMessage {
  constructor(message) {
    this.message = message;
    this._message = null;
    
    this._setupTypeData();
  }

  get type() {
    return this._message.type;
  }
  
  get data() {
    return this._message.data;
  }

  _setupTypeData() {
    if (isEnvelope(this.message)) {
      this._message = unpackEnvelope(this.message);
    } else {
      // TODO: Should we ever support a missing envelope
      // Raw data, detect by parsing
      console.log('~~message: no envelope');
      if (this.message.version) {
        this._message = {
          namespace: 'xviz',
          type: 'metadata',
          data: this.message
        };
      } else if (this.message.update_type && this.message.updates) {
        this._message = {
          namespace: 'xviz',
          type: 'state_update',
          data: this.message
        };
      } else {
        console.log('Unknown Type');
        this._message = {
          namespace: null,
          type: null,
          data: this.message
        };
      }
      // start
      //  version session_type, message_format
      //  ? what is the default
      // error
      //   message
      // transform_log_done
      //  id
      // transform_log
      //  id
      //    start_timestamp
      //    end_timestamp
      //    desired_streams
      // reconfigure
      //   update_type
      //   config_update
      // transform_point_in_time
      //  id, query_timestamp
    }
  }
};
