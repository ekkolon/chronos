/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { InjectionToken, Provider } from '@angular/core';
import { IdleManager } from './idle-manager';

/**
 * Configuration for observing user *idle* state.
 */
export interface IdleManagerConfig {
  inactiveAfterMs: number;
}

export const IDLE_MANAGER_CONFIG = new InjectionToken<IdleManagerConfig>('IDLE_MANAGER_CONFIG');

const DEFAULT_IDLE_MANAGER_OPTIONS: Partial<IdleManagerConfig> = {
  inactiveAfterMs: 2250,
} satisfies IdleManagerConfig;

export const provideIdleManager = (options?: Partial<IdleManagerConfig>): Provider => {
  return [
    IdleManager,
    {
      provide: IDLE_MANAGER_CONFIG,
      useValue: {
        ...DEFAULT_IDLE_MANAGER_OPTIONS,
        ...options,
      },
    },
  ];
};
