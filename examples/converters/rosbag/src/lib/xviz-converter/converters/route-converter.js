import _ from 'lodash';
import {v4 as uuid} from 'uuid';
import {ROUTE} from '../topics';
import Converter from './base/converter';

export default class RouteConverter extends Converter {
  constructor(xvizNamespace) {
    super();
    this.ROUTE = xvizNamespace;
  }

  convertFrame(frame, xvizBuilder) {
    let routeMessages = frame[ROUTE];
    if (!routeMessages) {
      if (!this.previousRouteMessages) {
        return;
      }
      routeMessages = this.previousRouteMessages;
    }
    this.previousRouteMessages = routeMessages;

    for (const {message} of routeMessages) {
      const {markers} = message;
      const points = _.chain(markers)
        .map('points')
        .reject(_.isEmpty)
        .flatten()
        .slice(0, -2) // Our last point seems to return to origin, so chop it off
        .map(p => [p.x, p.y, 0])
        .value();

      if (!_.isEmpty(points)) {
        xvizBuilder
          .primitive(this.ROUTE)
          .polyline(points)
          .style({
            stroke_color: [0, 0, 255, 60]
          })
          .id(uuid());
      }
    }
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.ROUTE)
      .coordinate('IDENTITY')
      .category('primitive')
      .type('polyline')
      .streamStyle({
        stroke_width: 3,
        stroke_width_min_pixels: 1
      });
  }
}
