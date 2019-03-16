const fs = require('fs');
const path = require('path');

import {XVIZData} from './xviz-data';

const FRAME_DATA_SUFFIX = '-frame.glb';

// Support various formatted frame names
function getFrameName(index) {
  if (index === 0) {
    return `0-frame.json`;
  }

  return `${index}${FRAME_DATA_SUFFIX}`
}

function xvizPath(filepath, index) {
  return path.join(filepath, getFrameName(index));
}

export function makeBinaryDataSource(root, filepath, params) {
  const rootpath = path.join(root, filepath);
  console.log(`looking at ${xvizPath(rootpath, 1)}`);
  if (fs.existsSync(xvizPath(rootpath, 1))) {
    return new XVIZBinaryDataSource(rootpath);
  }

  return null;
}

// return bytearray or undefined
function readFile(filePath) {
  if (fs.existsSync(filePath)) {
    return new XVIZData(fs.readFileSync(filePath));
  }

  return undefined;
}

class XVIZBinaryDataSource {
  constructor(filepath) {

    console.log('~~binary xviz source');
    this.root = filepath;
    this.indexFile = readFile(xvizPath(this.root, 0));
    this.metadata = readFile(xvizPath(this.root, 1));
  }

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

  xvizFrameByIndex(index) { // |range
    return readFile(xvizPath(this.root, index));
  }
};
