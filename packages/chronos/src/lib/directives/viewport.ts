/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { Directive, ElementRef, inject } from '@angular/core';

/**
 * The `ChronTimelineViewport` directive represents the viewport element within a Chronos timeline.
 * It can be applied to an HTML element using the `[chronViewport]` selector.
 */
@Directive({ selector: '[chronViewport]', standalone: true })
export class ChronTimelineViewport {
  /**
   * The reference to the HTML element associated with this directive.
   */
  readonly elementRef = inject(ElementRef);
}
