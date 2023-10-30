/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { Provider } from '@angular/core';

import { InteractionManagerGeometry } from './interaction-manager';
import { Orientation } from './utils/position';

export class ChronTimelineConfig implements Required<InteractionManagerGeometry> {
  orientation!: Orientation;
  offsetEnd!: number;
  offsetStart!: number;
}

const defaultOptions = {
  offsetEnd: 24,
  offsetStart: 24,
  orientation: Orientation.Vertical,
} satisfies ChronTimelineConfig;

export function provideTimelineConfig(config?: ChronTimelineConfig): Provider {
  return {
    provide: ChronTimelineConfig,
    useValue: { ...defaultOptions, config },
  };
}
