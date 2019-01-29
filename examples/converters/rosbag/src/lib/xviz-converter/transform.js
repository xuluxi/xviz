import {XVIZWriter} from '@xviz/builder';
import * as Topics from './topics';
import Bag from './lib/bag';
import {TimeUtil} from 'rosbag';

import {createDir, deleteDirRecursive} from './lib/util';
import FrameBuilder from './frame-builder';

export default async function transform(args) {
  const profileStart = Date.now();

  const {bag: bagPath, outputDir, disableStreams, frameLimit = Number.MAX_VALUE} = args;

  console.log(`Converting data at ${bagPath}`); // eslint-disable-line
  console.log(`Saving to ${outputDir}`); // eslint-disable-line

  try {
    deleteDirRecursive(outputDir);
  } catch (err) {
    // ignore
  }
  createDir(outputDir);
  const bag = new Bag({
    bagPath,
    keyTopic: Topics.CURRENT_POSE,
    topics: Topics.ALL
  });

  const {origin, frameIdToPoseMap} = await bag.calculateMetadata();
  const frameBuilder = new FrameBuilder({
    origin,
    frameIdToPoseMap,
    disableStreams
  });

  // This abstracts the details of the filenames expected by our server
  const xvizWriter = new XVIZWriter();

  let frameNum = 0;
  let startTime = null;
  let endTime = null;
  await bag.readFrames(async frame => {
    try {
      if (frameNum < frameLimit) {
        endTime = TimeUtil.toDate(frame.keyTopic.timestamp);
        if (!startTime) {
          startTime = endTime;
        }

        const xvizFrame = await frameBuilder.buildFrame(frame);
        xvizWriter.writeFrame(outputDir, frameNum, xvizFrame);
        frameNum++;
      }
    } catch (err) {
      console.error(err);
    }
  });

  if (!startTime) {
    throw new Error('No key frames found');
  }

  // Write metadata file
  const xb = frameBuilder.getXVIZMetadataBuilder();
  xb.startTime(startTime.getTime() / 1e3).endTime(endTime.getTime() / 1e3);
  xvizWriter.writeMetadata(outputDir, xb.getMetadata());

  xvizWriter.writeFrameIndex(outputDir);

  const profileEnd = Date.now();
  console.log(`Generate ${frameNum} frames in ${(profileEnd - profileStart) / 1000}s`); // eslint-disable-line
}
