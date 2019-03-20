/**
 * Memory storage for XVIZ data
 */
export class MemorySink {
  constructor() {
    this.data = new Map();
  }

  writeSync(name, data) {
    this.data.set(name, data);
  }

  has(name) {
    return this.data.has(name);
  }

  get(name) {
    return this.data.get(name);
  }
}
