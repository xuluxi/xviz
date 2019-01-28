import {quaternionToEuler} from '../lib/util';
import Converter from './base/converter';

export default class GPSConverter extends Converter {
  constructor(xvizNamespace, origin) {
    super();
    this.VEHICLE_TRAJECTORY = [xvizNamespace, 'trajectory'].join('/');
    this.origin = origin;
  }

  convertFrame(frame, xvizBuilder) {
    this._buildPose(frame, xvizBuilder);
    this._buildTrajectory(frame, xvizBuilder);
  }

  _buildPose(frame, xvizBuilder) {
    const {timestamp, message} = frame.keyTopic;

    // Every frame *MUST* have a pose. The pose can be considered
    // the core reference point for other data and usually drives the timing
    // of the system.

    // Position, decimal degrees
    const rotation = quaternionToEuler(message.pose.orientation);
    const {position} = message.pose;
    xvizBuilder
      .pose('/vehicle_pose')
      .mapOrigin(this.origin.longitude, this.origin.latitude, this.origin.altitude)
      .position(position.x, position.y, 0)
      .orientation(rotation.roll, rotation.pitch, rotation.yaw)
      .timestamp(timestamp.toDate().getTime());
  }

  _buildTrajectory(frame, xvizBuilder) {
    const data = frame['/planner/path'];
    if (!data) {
      return;
    }

    for (const d of data) {
      const polyline = d.message.poses.map(p => {
        const {position} = p.pose;
        return [position.x, position.y, position.z];
      });

      xvizBuilder
        .primitive(this.VEHICLE_TRAJECTORY)
        .polyline(polyline)
        .id('vehicle-path');
    }
  }

  getMetadata(xvizMetaBuilder) {
    // You can see the type of metadata we allow to define.
    // This helps validate data consistency and has automatic
    // behavior tied to the viewer.
    xvizMetaBuilder
      .stream('/vehicle_pose')
      .category('pose')

      .stream(this.VEHICLE_TRAJECTORY)
      .coordinate('IDENTITY')
      .category('primitive')
      .type('polyline')

      // This styling information is applied to *all* objects for this stream.
      // It is possible to apply inline styling on individual objects.
      .streamStyle({
        stroke_color: '#57AD57AA',
        stroke_width: 1.4,
        stroke_width_min_pixels: 1
      });
  }
}
