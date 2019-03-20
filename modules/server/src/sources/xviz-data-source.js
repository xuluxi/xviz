// could be json or glb or whatever
//
// Ideally it would just provide raw data
// w/o conversion unless necessary.
class XVIZDataSource {
  constructor() {}

  configuration() {}
  reconfigure() {}

  async xvizIndex() {}
  async xvizMetadata() {}
  async xvizFrameByIndex(index) {}
  async xvizFrameByTimestamp(timestamp) {}
};

// XVIZJSONDataSource
// send as raw arraybuffer
// send as JSON string w/ compression

// convert to GLB arraybuffer
