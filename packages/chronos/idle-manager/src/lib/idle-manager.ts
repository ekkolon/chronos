/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  EventEmitter,
  Injectable,
  Injector,
  NgZone,
  PLATFORM_ID,
  computed,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, fromEvent, merge, takeWhile, tap } from 'rxjs';

import { IDLE_MANAGER_CONFIG } from './idle-manager.config';

/**
 * Provides functionality for tracking and managing user idle time.
 */
@Injectable()
export class IdleManager {
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  private readonly config = inject(IDLE_MANAGER_CONFIG);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly win = this.doc.defaultView ?? (this.doc as never)['parentWindow'];

  private DOCUMENT_EVENT_NAMES: ReadonlyArray<keyof DocumentEventMap> = [
    'click',
    'DOMMouseScroll' as never,
    'keypress',
    'MSPointerMove' as never,
    'mousedown',
    'mousemove',
    'mousewheel' as never,
    'touchmove',
  ];

  private WINDOW_EVENT_NAMES: ReadonlyArray<keyof WindowEventMap> = ['mousemove', 'load', 'resize'];

  private readonly idleState = signal<boolean>(false);

  /**
   * Signal holding the current idle state; `true` for idle, `false` for active
   */
  readonly isIdle = computed(() => this.idleState());

  /** Event emitted when the user becomes inactive. */
  readonly onIdle = new EventEmitter<void>();

  // We use `ReturnType` here to avoid typing conflicts when running jest tests
  private inactivityTimer?: ReturnType<typeof setTimeout>;

  /**
   * Starts monitoring user interactions with the DOM and toggles *idle* state
   * on or off based on those interactions.
   */
  observe(): void {
    runInInjectionContext(this.injector, () => {
      this.getActivityEvents()
        .pipe(
          takeWhile(() => this.isBrowser),
          tap(() => {
            this.restartInactivityTimer();

            // User is active
            this.toggleIdleState(false);
          }),
          takeUntilDestroyed()
        )
        .subscribe();
    });

    // Start the initial inactivity timer
    this.startInactivityTimer();
  }

  private restartInactivityTimer(): void {
    // Reset the inactivity timer whenever there's user activity
    this.resetInactivityTimer();

    // Restart inactivity timer
    this.startInactivityTimer();
  }

  // Start the inactivity timer
  private startInactivityTimer(): void {
    this.ngZone.runOutsideAngular(() => {
      this.inactivityTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.resetInactivityTimer();

          this.onIdle.emit();

          // User is inactive
          this.toggleIdleState(true);
        });
      }, this.config.inactiveAfterMs);
    });
  }

  // Reset the inactivity timer
  private resetInactivityTimer(): void {
    this.ngZone.runOutsideAngular(() => {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = undefined;
    });
  }

  // Toggle user activity state
  private toggleIdleState(active: boolean): void {
    this.idleState.set(active);
  }

  // Create an observable for user activity based on DOM events
  private getActivityEvents(): Observable<Event> {
    const mapEvent = (target: Window | Document) => {
      return (eventName: string) => fromEvent(target, eventName);
    };

    const windowEvents = this.WINDOW_EVENT_NAMES.map(mapEvent(this.win));

    const docEvents = this.DOCUMENT_EVENT_NAMES.map(mapEvent(this.doc));

    return merge(...docEvents, ...windowEvents);
  }
}
