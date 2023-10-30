/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { Directive } from '@angular/core';

import { PositionableElement } from './positionable-element';

/**
 * A directive representing a cursor trackbar element within a Chronos timeline.
 * This directive is used to display a cursor trackbar that is laid out based on
 * an `Orientation` value and a position pixel value along the main axis
 * determined by that orientation.
 */
@Directive({
  selector: 'chron-timeline-cursor-trackbar, [chronTimelineCursorTrackbar]',
  standalone: true,
  host: {
    class: 'chron-timeline-cursor-trackbar',
  },
})
export class ChronTimelineCursorTrackbar extends PositionableElement {}
