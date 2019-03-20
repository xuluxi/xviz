const fs = require('fs');
const path = require('path');

import {XVIZData} from '@xviz/io';

const FRAME_DATA_SUFFIX = '-frame.json';

// Support various formatted frame names
function getFrameName(index) {
  return `${index}${FRAME_DATA_SUFFIX}`
}

function xvizPath(filepath, index) {
  return path.join(filepath, getFrameName(index));
}

export function makeJSONDataSource(root, filepath, params) {
  const rootpath = path.join(root, filepath);
  console.log(`looking at ${xvizPath(rootpath, 1)}`);
  if (fs.existsSync(xvizPath(rootpath, 1))) {
    return new XVIZJSONDataSource(rootpath);
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

function readJSON(filePath) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }

  return undefined;
}

// Load frame timestamps by opening every frame to extract
/*
function loadFrameTimings(frames) {
  let lastTime = 0;
  const timings = frames.map(frame => {
    const data = getFrameData(frame);

    const result = unpackFrame(data);

    const ts = getTimestamp(result.json);
    if (Number.isFinite(ts)) {
      lastTime = ts;
    }

    return lastTime;
  });

  // Remove metadata timing
  return timings;
}
*/

// could be json or glb or whatever
//
// Ideally it would just provide raw data
// w/o conversion unless necessary.
//
// would be nice to have a FileDataProvider
class XVIZJSONDataSource {
  constructor(filepath) {

    this.root = filepath;
    // {
    //  startTime
    //  endTime
    //  timing [
    //    [first, end, index, "2-frame'],
    //  ]
    // }
    this.indexFile = readJSON(xvizPath(this.root, 0));
    this.metadata = readXVIZ(xvizPath(this.root, 1));

    if (!this.indexFile.start_timestamp || !this.indexFile.end_timestamp) {
      console.log('index file needs recreated');
    }
  }

  // TODO: this is a custom object, may not be needed?
  // accessed by FrameByIndex & FrameByTime
  async xvizIndex() {
    return this.indexFile;
  }

  xvizMetadata() {
    return this.metadata;
  }

  xvizFrameByIndex(index) {
    return readXVIZ(xvizPath(this.root, index));
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

  _createIndex() {
    const startTime = Number.MAX_VALUE; 
    const endTime = 0;
    const timing = [] // min, max, index, name

    // TODO: could use streaming JSON parser rather than
    // read the whole file

    // TODO: turn into generator then use for of/in
    this._iterateFrames(obj => {
      const xvizObj = obj.object();
      // xvizObj.data

      // should be update_type 
      // verify updates length
      // map all timings, sort, 
    });

    this.indexFile = {
      startTime,
      endTime,
      timing
    };
  }
};
