/* global Buffer */
import {open} from 'rosbag';
import {quaternionToEuler} from './util';

export default class Bag {
  constructor({bagPath, keyTopic, topics}) {
    this.bagPath = bagPath;
    this.keyTopic = keyTopic;
    this.topics = topics;
  }

  /**
   * Calculate all metadata needed by converters. Currently lumped into a single function
   * call to ensure we only need to make a single bag read.
   *
   * Extracts:
   *   origin: map origin
   *   frameIdToPoseMap: ROS /tf transform tree
   */
  async calculateMetadata() {
    const CONFIGURATION = '/commander/configuration';
    const TF = '/tf';

    let origin = {latitude: 0, longitude: 0, altitude: 0};
    const frameIdToPoseMap = {};

    const start = Date.now();
    const bag = await open(this.bagPath);
    await bag.readMessages({topics: [CONFIGURATION, TF]}, ({topic, message}) => {
      if (topic === CONFIGURATION) {
        const configuration = message.keyvalues.reduce((memo, kv) => {
          memo[kv.key] = kv.value;
          return memo;
        }, {});

        if (configuration['map_lat']) {
          origin = {
            latitude: parseFloat(configuration['map_lat']),
            longitude: parseFloat(configuration['map_lng']),
            altitude: parseFloat(configuration['map_alt'])
          };
        }
      }
      else if (topic === TF) {
        message.transforms.forEach((t) => {
          frameIdToPoseMap[t.child_frame_id] = {
            ...t.transform.translation,
            ...quaternionToEuler(t.transform.rotation)
          };
        });
      }
    });

    console.log('Calc metadata', (Date.now()-start)/1000);

    return {
      origin,
      frameIdToPoseMap
    };
  }

  // We synchronize frames along messages in the `keyTopic`.
  async readFrames(onFrame) {
    const bag = await open(this.bagPath);

    let frame = {};
    async function flushFrame() {
      if (frame.keyTopic) {
        await onFrame(frame);
        frame = {};
      }
    }

    await bag.readMessages({topics: this.topics}, async (result) => {
      // rosbag.js reuses the data buffer for subsequent messages, so we need to make a copy
      if (result.message.data) {
        result.message.data = Buffer.from(result.message.data);
      }
      if (result.topic === this.keyTopic) {
        await flushFrame();
        frame.keyTopic = result;
      }
      frame[result.topic] = frame[result.topic] || [];
      frame[result.topic].push(result);
    });

    // Flush the final frame
    await flushFrame();
  }
}
