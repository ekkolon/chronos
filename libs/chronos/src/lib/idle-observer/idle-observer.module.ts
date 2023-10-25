/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { ModuleWithProviders, NgModule } from '@angular/core';

import { IdleObserver } from './idle-observer';
import { IdleObserverConfig, provideIdleObserverConfig } from './idle-observer.config';

/**
 * Provides services and configurations for observing and managing user idle time
 * within an Angular application.
 */
@NgModule({
  providers: [IdleObserver, provideIdleObserverConfig()],
})
export class IdleObserverModule {
  private static isInitialized = false;

  static forRoot(options?: Partial<IdleObserverConfig>): ModuleWithProviders<IdleObserverModule> {
    if (IdleObserverModule.isInitialized) {
      throw new Error(`${this.constructor.name} is already loaded`);
    }

    return {
      ngModule: IdleObserverModule,
      providers: [IdleObserver, provideIdleObserverConfig(options)],
    };
  }
}
