import tape from 'tape-catch';

import {
  TextEncoder,
  XVIZBinaryWriter,
  XVIZData,
  XVIZFormatter
} from '@xviz/io';

// Source test data
import TestXVIZSnapshot from 'test-data/sample-xviz';

// Various formats for the test data
const TestXVIZSnapshotString = JSON.stringify(TestXVIZSnapshot);
const TestXVIZSnapshotBuffer = new TextEncoder().encode(JSON.stringify(TestXVIZSnapshot));
let TestXVIZSnapshotGLB = null;

// make binary in memory
const writer = new XVIZBinaryWriter(
  {
    writeSync: (n, d) => {
      TestXVIZSnapshotGLB = d;
    }
  }
);
writer.writeFrame(0, TestXVIZSnapshot);

tape('XVIZFormatter#full matrix', t => {
  const dataSources = [TestXVIZSnapshot, TestXVIZSnapshotString, TestXVIZSnapshotBuffer, TestXVIZSnapshotGLB];
  for (let source of dataSources) {
    const xvizObj = new XVIZData(source);

    for (let format of ['binary', 'json_buffer', 'json_string']) {
      t.comment(`-- TestCase ${xvizObj.dataFormat()} to ${format}`);

      // Convert the data to the requested format
      const rawData = XVIZFormatter(xvizObj, {format});
      t.ok(rawData.length, 'has formatted data');

      // Verify the data is parsed as the expected format
      const newObj = new XVIZData(rawData);
      t.equal(newObj.dataFormat(), format, `data format matches`);
    }
  }

  t.end();
});
