import {
  MemorySink,
  XVIZBinaryWriter,
  XVIZJSONWriter
} from '@xviz/io';

import {TextEncoder} from '../common/text-encoding';
import {XVIZData} from '../sources/xviz-data';


// TODO: how to register and manage options 
// TODO: add draco option
export function XVIZFormatter(xvizData, {format}) {
  const formatIn = xvizData.dataFormat();
  console.log('formatOut', format);
  console.log('formatIn', formatIn);
  console.log('formatter', xvizData instanceof XVIZData);

  // If we are not asked to convert
  // or they match and we have not mutated anything
  if (!format || formatIn == format) {
    // need to check if object() has been called (ie it might be dirty) and repack
    if (!xvizData.hasMessage()) {
      console.log('~~~ no format conversion');
      return xvizData.buffer;
    }
  }

  // * => JS object => output with XVIZWriter
  const msg = xvizData.message(); 
  const sink = new MemorySink();
  let writer = null;
  let suffix = null;
  let id = null;
  switch (format) {
    case 'binary':
      writer = new XVIZBinaryWriter(sink);
      suffix = 'glb';
      break;
    case 'json_buffer':
    case 'json_string':
      writer = new XVIZJSONWriter(sink);
      suffix = 'json';
      break;
    default:
      throw new Error(`Cannot convert XVIZData to format ${format}`);
  }

  console.log('xxx', JSON.stringify(msg.data, null, 2).slice(0, 200));
  if (msg.type === 'metadata') {
    console.log('~~ write metadta');
    id = 1;
    writer.writeMetadata(msg.data);
  } else {
    console.log('~~ write frame');
    id = 3;
    writer.writeFrame(1, msg.data);
  }

  let result = sink.get(`${id}-frame.${suffix}`);
  console.log('~~ binary result', result);
  if (format === 'json_buffer') {
    const encoder = new TextEncoder()
    result = encoder.encode(result);
  }

  console.log('~~ binary wrote', typeof result);
  return result;
}
