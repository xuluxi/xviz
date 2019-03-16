import tape from 'tape-catch';

import {XVIZData} from '@xviz/server';
import {TextEncoder} from 'text-encoding';
import {XVIZWriter} from '@xviz/builder';

import TestXVIZSnapshot from 'test-data/sample-xviz';

const TestXVIZSnapshotString = JSON.stringify(TestXVIZSnapshot);
const TestXVIZSnapshotBuffer = new TextEncoder().encode(JSON.stringify(TestXVIZSnapshot));
let TestXVIZSnapshotGLB = null;
const writer = new XVIZWriter({
  dataSink: {writeSync: (s, n, d) => {
    TestXVIZSnapshotGLB = d;
    }
  }
});
writer.writeFrame('test', 0, TestXVIZSnapshot);

const TestCases = [
  {
    name: 'object',
    data: TestXVIZSnapshot,
    dataType: 'object'
  },
  {
    name: 'string',
    data: TestXVIZSnapshotString,
    dataType: 'json_string'
  },
  {
    name: 'arraybuffer',
    data: TestXVIZSnapshotBuffer,
    dataType: 'json_buffer'
  },
  {
    name: 'binary',
    data: TestXVIZSnapshotGLB,
    dataType: 'binary'
  }
];

tape.only('XVIZData#constructor', t => {
  for (let test of TestCases) {
    const xvizObj = new XVIZData(test.data);
    t.equal(xvizObj.dataType(), test.dataType, `data as ${test.name} has expected dataType`);

    const obj = xvizObj.object();
    t.equal(obj.type(), 'state_update', `data as ${test.name} has expected XVIZ type`);
    t.ok(obj.data.updates[0].timestamp, `data as ${test.name} has expected timestamp present`);
  }

  t.end();
});
