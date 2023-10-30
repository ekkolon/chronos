/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { Observable, animationFrameScheduler, fromEvent, scheduled, tap } from 'rxjs';

/**
 * Creates an observable event source that emits events on the animation frame scheduler.
 *
 * @param eventName - The name of the event to listen for on the target element.
 * @param target - The target HTMLElement where the event should be observed.
 * @param handler - A function that handles each emitted event.
 * @returns An observable that emits events on the animation frame scheduler.
 * @template T - The type of the event that will be emitted.
 */
export const animationFrameScheduledEvent = <T extends Event>(
  eventName: string,
  target: HTMLElement,
  handler: AnimationFrameScheduledEventHandler<T>
) => {
  const evt$ = fromEvent(target, eventName, { passive: true });
  return scheduled(evt$, animationFrameScheduler).pipe(tap(handler) as never) as Observable<T>;
};

/**
 * A function that handles events emitted by the `animationFrameScheduledEvent` function.
 *
 * @template T - The type of the event that the handler will process.
 */
export type AnimationFrameScheduledEventHandler<T = unknown> = (event: T) => void;
