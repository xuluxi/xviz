import _ from 'lodash';
import {loadProcessedLidarData} from '../lib/parse-lidar-points';
import Converter from './base/converter';

const MAX_POINTS = 20000;

/**
 * This just does a very basic random downsampling based on the ratio of
 * maxPointsCount and actual points in the point cloud. As such, it is not guaranteed
 * to exactly cap at maxPointsCount.
 */
function downSamplePoints(points, maxPointsCount) {
  const chunkSize = 3;
  const pointsCount = points.length / chunkSize;

  if (pointsCount <= maxPointsCount) {
    return points;
  }

  const sampleRate = maxPointsCount / pointsCount;
  const ret = [];
  for (let i = 0; i < points.length/chunkSize; i++) {
    if (Math.random() < sampleRate) {
      for (let j = 0; j < chunkSize; j++) {
        ret.push(points[i*chunkSize + j]);
      }
    }
  }

  return Float32Array.from(ret);
}

export default class LidarConverter extends Converter {
  constructor(xvizNamespace) {
    super();

    this.LIDAR_POINTS = xvizNamespace;
    this.previousData = {};
  }

  convertFrame(frame, xvizBuilder) {
    this._buildPoints(frame, xvizBuilder, {
      topic: '/commander/points_fore',
      color: '#00ff00aa'
    });
  }

  _buildPoints(frame, xvizBuilder, {color, topic}) {
    let data = frame[topic];
    if (!data) {
      data = this.previousData[topic];
      if (!data) {
        return;
      }
    }
    this.previousData[topic] = data;

    for (const {message} of data) {
      const pointsSize = message.data.length / (message.height * message.width);
      const {positions} = loadProcessedLidarData(message.data, pointsSize);

      xvizBuilder
        .primitive(this.LIDAR_POINTS)
        .points(downSamplePoints(positions, MAX_POINTS))
        .style({fill_color: color});
    }
  }

  getMetadata(xvizMetaBuilder, frameIdToPoseMap) {
    const streamMetadata = xvizMetaBuilder.stream(this.LIDAR_POINTS)
      .category('primitive')
      .type('point')
      .streamStyle({
        fill_color: '#00a',
        radiusPixels: 3
      });

    const pose = (frameIdToPoseMap || {}).velodyne;
    if (pose) {
      console.log('pose', pose);
      streamMetadata.pose(_.pick(pose, ['x', 'y', 'z']), _.pick(pose, ['roll', 'pitch', 'yaw']));
    }
  }
}
