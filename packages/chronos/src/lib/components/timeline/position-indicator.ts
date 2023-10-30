/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { Directive } from '@angular/core';

import { PositionableElement } from '../../directives/positionable-element';

/**
 * A directive representing a position indicator element within a Chronos timeline.
 * This directive is used to display a position indicator that is laid out based
 * on an `Orientation` value and a position pixel value along the main axis
 * determined by that orientation.
 */
@Directive({
  selector: 'chron-timeline-position-indicator, [chronTimelinePositionIndicator]',
  standalone: true,
  host: {
    class: 'chron-timeline-position-indicator',
  },
})
export class ChronTimelinePositionIndicator extends PositionableElement {}
