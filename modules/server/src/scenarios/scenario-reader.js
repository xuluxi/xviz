// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export class ScenarioReader {
  constructor(source, options = {}) {
    this.source = source;
    /*
     * metadata
     * frames
     * timing
     */
    this.options = options;

    // Read the frame index
    this.index = this._readIndex();
    /* 
     * startTime,
     * endTime,
     * timing: [ ts0, ts1, ...]
     */
  }

  readMetadata() {
    return this.source.metadata;
  }

  readFrame(frameIndex) {
    return this.source.frames[frameIndex];
  }

  timeRange() {
    if (this.index) {
      const {startTime, endTime} = this.index;
      return {startTime, endTime};
    }

    return {startTime: null, endTime: null};
  }

  frameCount() {
    if (this.index) {
      return this.index.timing.length;
    }

    return undefined;
  }

  // Returns 2 indices covering the frames that bound the requested timestamp
  findFrame(timestamp) {
    if (!this.index) {
      return undefined;
    }

    const {startTime, endTime, timing} = this.index;
    const frameCount = this.frameCount();
    const lastFrame = frameCount > 0 ? frameCount - 1 : 0;

    if (timestamp < startTime) {
      return {first: 0, last: 0};
    }

    if (timestamp > endTime) {
      return {first: lastFrame, last: lastFrame};
    }

    let first = timing.findIndex(timeEntry => timeEntry >= timestamp);

    // Reverse search for end index
    let last = -1;
    let i = lastFrame;
    while (i >= 0) {
      if (timing[i] <= timestamp) {
        last = i;
        break;
      }

      i--;
    }

    if (first === -1) {
      first = 0;
    }

    if (last === -1) {
      last = lastFrame;
    }

    return {first, last};
  }

  close() {}

  _readIndex() {
    return {
      startTime: this.source.timing[0],
      endTime: this.source.timing[this.source.timing.length - 1],
      timing: this.source.timing
    };
  }
}
