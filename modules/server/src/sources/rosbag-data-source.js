const fs = require('fs');
const path = require('path');

import {XVIZData} from '@xviz/io';

const DATA_SUFFIX = '.bag';

export function makeROSBAGDataSource(root, filepath, params) {
  // TODO: path may have a leading "/" beware of this
  const rootpath = path.join(root, filepath + DATA_SUFFIX);
  console.log(`looking at ${rootpath}`);

  if (fs.existsSync(rootpath))) {
    return new XVIZROSBAGDataSource(rootpath);
  }

  return null;
}

// return bytearray or undefined
function readXVIZ(filePath) {
  if (fs.existsSync(filePath)) {
    return new XVIZData(fs.readFileSync(filePath));
  }

  return undefined;
}

class XVIZBinaryDataSource {
  constructor(root) {

    console.log('~~binary xviz source');
    this.root = root;
    this.indexFile = readJSON(xvizPath(this.root, 0));
    this.metadata = readXVIZ(xvizPath(this.root, 1));
  }

  // TODO
  // all async?
  // limits() for min/max time/frame
  // configuration(config) {}
  // reconfigure(config) {}
  // xvizFrameByTimestamp(timestamp|range) {}

  async xvizIndex() {
    return this.indexFile;
  }

  xvizMetadata() {
    return this.metadata;
  }

  getFrameRange(startTime, endTime) {
    let start = this.indexFile.start_timestamp;
    let end = this.indexFile.end_timestamp;

    // bounds check params
    if (startTime) {
      if (startTime >= start && startTime <= end) {
        start = startTime;
      }
    }

    if (endTime) {
      if (endTime >= start && endTime <= end) {
        end = endTime;
      } else {
        // todo: allow server duration limit
        end = start + 30;
      }
    }
    // todo: server limit on duration

    // Find indices based on time
    start = this.indexFile.timing.findIndex(timeEntry => start >= timeEntry[0]);
    if (start === -1) {
      start = 2;
    }

    end = this.indexFile.timing.findIndex(timeEntry => end >= timeEntry[1]);
    if (end === -1) {
      end = this.indexFile.timing.length;
    }

    return {start, end}
  }

  xvizFrameByIndex(index) { // |range
    return readXVIZ(xvizPath(this.root, index));
  }
};
