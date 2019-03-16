import {XVIZSessionHandler} from './xviz-session-handler';
import {PreloadDataSource} from '../sources/preload-source';

// Setup the source and return a SessionHandler or null
export class XVIZSession {
  constructor(factory, options) {
    this.factory = factory;
    this.options = options;
  }

  newSession(socket, req = {path, params}) {
    let source = this.factory.open(this.options.d, req.path, req.params);
    if (source) {
      console.log('~~Valid xviz source');
      // handle options.preload
      return new XVIZSessionHandler(socket, req, source, this.options);
    }

    return null;
  }
}
