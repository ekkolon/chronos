/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { EventEmitter, computed, signal } from '@angular/core';

import { Observable, Subject, fromEvent, merge, mergeMap, repeat, takeUntil, tap } from 'rxjs';

import { ElementOrRef, coerceElement } from './utils/coercion';
import { animationFrameScheduledEvent } from './utils/events';
import { round } from './utils/math';
import {
  Area2d,
  DirectionOfTravel,
  Orientation,
  clamp,
  getDirectionOfTravelFromWheel,
  getMainAxisPosition,
  getRelativePosition,
} from './utils/position';

/**
 * Configuration options for the MovementDetector.
 */
export interface InteractionManagerGeometry {
  offsetStart?: number;
  offsetEnd?: number;
  orientation?: Orientation;
}

const defaultOptions = {
  offsetEnd: 0,
  offsetStart: 0,
  orientation: Orientation.Vertical,
} satisfies Required<InteractionManagerGeometry>;

/**
 * Complete configuration for the MovementDetector.
 */
export interface InteractionManagerConfig extends InteractionManagerGeometry {
  readonly container: ElementOrRef;
  readonly viewport: ElementOrRef;
  distance: number;
}

/**
 * Update configuration for the MovementDetector.
 */
export interface InteractionManagerUpdateConfig extends InteractionManagerGeometry {
  distance?: number;
}

/**
 * Manages interactions within a Chronos `Timeline` container and viewport.
 */
export class InteractionManager {
  private readonly destroyed = new Subject<void>();

  private config: Required<InteractionManagerConfig>;

  private readonly containerEl: HTMLElement;
  private readonly viewportEl: HTMLElement;

  /** A signal that holds the movement detector's current position in pixels. */
  private readonly _position = signal<number>(0);

  /** A computed property that provides read-only access to the current position state. */
  readonly position = computed(() => this.clamp(this._position()));

  /** A computed property that provides read-only access to the current position state. */
  readonly positionPct = computed(() => this.calcRelativeFraction(this._position()));

  /** A computed property that provides read-only access to the current position state. */
  readonly positionChanged = new EventEmitter<number>();

  /** A signal that holds the movement detector's current trackbar position in pixels. */
  private readonly _cursorPos = signal<number>(0);

  /** A computed property that provides read-only access to the current trackbar position state. */
  readonly cursorPos = computed(() => this.clamp(this._cursorPos()));

  /** An observable for click events within the container. */
  protected readonly click$: Observable<PointerEvent>;

  /** An observable for wheel events within the container. */
  protected readonly wheel$: Observable<WheelEvent>;

  /** An observable for mousemove events within the viewport. */
  readonly mousemove$: Observable<PointerEvent>;

  /** An observable for mouseleave events within the viewport. */
  readonly mouseleave$: Observable<PointerEvent>;

  /** An observable for mousedown events within the viewport. */
  protected readonly mousedown$: Observable<PointerEvent>;

  /** An observable for mouseup events within the viewport. */
  protected readonly mouseup$: Observable<PointerEvent>;

  /** An observable that combines mousemove and mousedown events. */
  private readonly moveUntilMousedown$: Observable<PointerEvent | MouseEvent>;

  /** An observable that combines mousemove and mouseup events. */
  private readonly moveUntilMouseup$: Observable<PointerEvent | MouseEvent>;

  /**
   * Constructs a new MovementDetector.
   * @param config - The configuration for the MovementDetector.
   */
  constructor(config: InteractionManagerConfig) {
    this.config = {
      ...defaultOptions,
      ...config,
    };

    this.containerEl = coerceElement(this.config.container);
    this.viewportEl = coerceElement(this.config.viewport);

    this.click$ = animationFrameScheduledEvent<PointerEvent>(
      'click',
      this.containerEl,
      this.onClick
    );

    this.wheel$ = animationFrameScheduledEvent<WheelEvent>('wheel', this.containerEl, this.onWheel);

    this.mousemove$ = animationFrameScheduledEvent<PointerEvent>(
      'mousemove',
      this.viewportEl,
      this.onMousemove
    );

    this.mouseleave$ = animationFrameScheduledEvent<PointerEvent>(
      'mouseleave',
      this.viewportEl,
      this.onMouseleave
    );

    this.mousedown$ = animationFrameScheduledEvent<PointerEvent>(
      'mousedown',
      this.viewportEl,
      this.onMousedown
    );

    this.mouseup$ = animationFrameScheduledEvent<PointerEvent>(
      'mouseup',
      this.viewportEl,
      this.onMousedown
    );

    const moveUntilMousedown$ = fromEvent<MouseEvent>(this.viewportEl, 'mousemove').pipe(
      takeUntil(this.mousedown$),
      repeat(),
      tap(this.onMousemove)
    );

    const moveUntilMouseup$ = fromEvent<MouseEvent>(this.viewportEl, 'mousedown').pipe(
      mergeMap(() => this.mousemove$.pipe(takeUntil(this.mouseup$))),
      tap(this.onMousedown)
    );

    this.moveUntilMousedown$ = moveUntilMousedown$.pipe(tap(this.onMousemove));

    this.moveUntilMouseup$ = moveUntilMouseup$.pipe(tap(this.onMousedown));
  }

  /**
   * Gets the length of the line segment defined by the configuration.
   * @returns The length of the line segment.
   */
  get lineSegment() {
    return this.config.distance;
  }

  /**
   * Returns the upper bound of the line segment.
   * The upper bound is calculated as the distance minus the offset at the end.
   */
  get upperBound() {
    return this.config.distance - this.config.offsetEnd;
  }

  /**
   * Returns the lower bound of the line segment.
   * The lower bound is determined by the offset at the start.
   */
  get lowerBound() {
    return this.config.offsetStart;
  }

  get totalOffset() {
    const { offsetEnd, offsetStart } = this.config;
    return offsetStart + offsetEnd;
  }

  get maxSpaceAvailable() {
    return this.lineSegment - this.totalOffset;
  }

  /**
   * Starts detecting movements based on configured observables.
   */
  detectInteractions() {
    merge(
      this.click$,
      this.wheel$,
      this.mouseleave$,
      this.moveUntilMousedown$,
      this.moveUntilMouseup$
    )
      .pipe(takeUntil(this.destroyed))
      .subscribe();
  }

  moveByFraction(fraction: number) {
    const rounded = round(this.config.distance * fraction, 2);
    const pos = this.clamp(rounded);
    this._position.set(pos);
  }

  moveByPixels(positionInPixels: number) {
    const pos = this.clamp(positionInPixels);
    this._position.set(pos);
  }

  updateConfig(config: InteractionManagerUpdateConfig): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  detach(): void {
    this.destroyed.next();
  }

  private calcRelativeFraction(posPx: number) {
    const relPos = posPx - this.totalOffset / 2;
    return relPos / this.maxSpaceAvailable;
  }

  private readonly onClick = (evt: PointerEvent): void => {
    const coords = getRelativePosition(evt, this.containerEl);
    const pos = this.clamp(coords);

    this.moveByPixels(pos);
  };

  private readonly onWheel = (evt: WheelEvent): void => {
    const direction = getDirectionOfTravelFromWheel(evt);

    if (this.isWithinBounds(direction)) {
      const posPercentage = this._position() / this.lineSegment;
      const newPosPercentage = posPercentage - direction / 100;
      this.moveByFraction(newPosPercentage);
    }
  };

  private readonly onMousemove = (evt: MouseEvent): void => {
    const coords = getRelativePosition(evt, this.viewportEl);
    const pos = this.clamp(coords);

    this.updateCursorPos(pos);
  };

  private readonly onMousedown = (evt: MouseEvent): void => {
    const coords = getRelativePosition(evt, this.viewportEl);
    const pos = this.clamp(coords);

    this.moveByPixels(pos);
    this.updateCursorPos(pos);
  };

  /**
   * A no-op handler for the onMouseleave event.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  private readonly onMouseleave = (_evt: MouseEvent) => {};

  private updateCursorPos(point: Area2d | number) {
    this._cursorPos.set(this.clamp(point));
  }

  private isWithinBounds(directionOfTravel: DirectionOfTravel) {
    const pos = this._position();
    const canMoveBackwards =
      directionOfTravel === DirectionOfTravel.Forward && pos > this.lowerBound;
    const canMoveForward = DirectionOfTravel.Backwards && pos < this.upperBound;

    return canMoveForward || canMoveBackwards;
  }

  /**
   * Clamps a position value within the specified range based on the configuration.
   *
   * This method ensures that the given position falls within
   * the defined range [offsetStart, distance - offsetEnd].
   *
   * If the position is less than {@link InteractionManager.lowerBound}, it is clamped to that.
   * If it is greater than {@link InteractionManager.lineSegment} - {@link InteractionManager.lowerBound},
   * it is clamped to {@link InteractionManager.lowerBound}.
   *
   * @param point - The position to be clamped, specified as either an Area2d object or a number.
   * @returns The clamped position value within the specified range.
   */
  private clamp(point: Area2d | number): number {
    const { distance, offsetStart, offsetEnd, orientation } = this.config;

    // Calculate the position on the main axis based on the orientation.
    const mainAxisPos = getMainAxisPosition(orientation, point);

    // Clamp the position within the defined range [offsetStart, distance - offsetEnd].
    return clamp(mainAxisPos, distance, offsetStart, offsetEnd);
  }
}
