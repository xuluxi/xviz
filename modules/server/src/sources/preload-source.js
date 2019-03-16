export class PreloadDataSource {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.frames = [0, 1];

    console.log('~~ Preloading Frames');
    this._preloadFrames();
    console.log(`~~ Loaded ${this.frames.length} Frames`);
  }

  _preloadFrames() {

    // for (let i = 2; i < Number.MAX_SAFE_INTEGER;  i++) {
    for (let i = 2; i < 10 ; i++) {
      const data = this.dataSource.xvizFrameByIndex(i);
      if (data) {
        // TODO: this is a hack and should not be required
        // pre-convert
        // console.log('preload', i);
        // data.object();
        this.frames.push(data);
        // console.log('preload done', i);
      } else {
        break;
      }
    }
  }

  async xvizIndex() {
    return this.dataSource.xvizIndex();
  }

  xvizMetadata() {
    return this.dataSource.xvizMetadata();
  }

  xvizFrameByIndex(index) {
    return this.frames[index];
  }
};
