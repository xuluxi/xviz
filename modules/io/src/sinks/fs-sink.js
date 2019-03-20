/**
 * Class to abstract away file IO
 */
export class FileSink {
  constructor(rootDirectory) {
    this.fs = module.require('fs');
    this.path = module.require('path');

    // TODO: verify it exists or create it
    // but do not overwrite files
    this.root = rootDirectory;
  }

  writeSync(name, data) {
    const xvizFrame = this.path.join(this.root, name);
    const options = {
      flag: 'w'
    };
    this.fs.writeFileSync(xvizFrame, data, options);
  }
}
