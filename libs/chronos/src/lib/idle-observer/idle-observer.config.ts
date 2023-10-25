/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { InjectionToken, Provider } from '@angular/core';

/**
 * Configuration for observing user *idle* state.
 */
export interface IdleObserverConfig {
  inactiveAfterMs: number;
}

export const IDLE_OBSERVER_CONFIG = new InjectionToken<IdleObserverConfig>('IDLE_TIME_CONFIG');

const DEFAULT_IDLE_OBSERVER_CONFIG: Partial<IdleObserverConfig> = {
  inactiveAfterMs: 2250,
} satisfies IdleObserverConfig;

export const provideIdleObserverConfig = (options?: Partial<IdleObserverConfig>): Provider => {
  return {
    provide: IDLE_OBSERVER_CONFIG,
    useValue: {
      ...DEFAULT_IDLE_OBSERVER_CONFIG,
      ...options,
    },
  };
};
