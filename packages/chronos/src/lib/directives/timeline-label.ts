/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { Component, Input } from '@angular/core';

import { PositionableElement } from './positionable-element';

/**
 * A component representing a label element within a Chronos timeline.
 * This component is used to display labels with text content that can be positioned
 * based on an `Orientation` value and a position pixel value along the main axis
 * determined by that orientation.
 */
@Component({
  selector: 'chron-timeline-label',
  template: `<div class="chron-timeline-label__text">{{ displayText }}</div>`,
  standalone: true,
  host: {
    class: 'chron-timeline-label',
  },
})
export class ChronTimelineLabel extends PositionableElement {
  @Input({ required: true }) displayText!: string | null;
}
