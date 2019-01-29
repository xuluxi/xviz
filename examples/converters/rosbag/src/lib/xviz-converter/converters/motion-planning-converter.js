import _ from 'lodash';
import {v4 as uuid} from 'uuid';
import {MP_PLAN} from '../topics';
import Converter from './base/converter';

export default class MotionPlanningConverter extends Converter {
  constructor(xvizNamespace) {
    super();
    this.ns = xvizNamespace;

    this.PLAN_STREAM = [this.ns, 'plan'].join('/');
  }

  convertFrame(frame, xvizBuilder) {
    let planMessages = frame[MP_PLAN];
    if (!planMessages) {
      return;
    }

    for (const {message} of planMessages) {
      const {poses} = message;
      const points = _.chain(poses)
        .map(p => _.get(p, 'pose.position'))
        .reject(_.isEmpty)
        .flatten()
        .map(p => [p.x, p.y, 0])
        .value();

      if (!_.isEmpty(points)) {
        xvizBuilder
          .primitive(this.PLAN_STREAM)
          .polyline(points)
          .style({stroke_color: [0, 255, 255, 255]})
          .id(uuid());
      }
    }
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.PLAN_STREAM)
      .coordinate('IDENTITY')
      .category('primitive')
      .type('polyline')
      .streamStyle({
        stroke_width: 0.2,
        stroke_width_min_pixels: 1
      });
  }
}
