/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Signal,
  ViewChild,
  ViewEncapsulation,
  computed,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';

import { merge, tap } from 'rxjs';

import { ChronTimelineCursorTrackbar } from './directives/cursor-trackbar';
import { ChronTimelinePositionIndicator } from './directives/position-indicator';
import { ChronTimelineLabel } from './directives/timeline-label';
import { ChronTimelineViewport } from './directives/viewport';
import { IdleObserver, IdleObserverModule } from './idle-observer';
import { InteractionManager } from './interaction-manager';
import { ChronTimelineConfig } from './timeline-config';
import { TimelineLayout, TimelineSegmentBase, Timestamp } from './timeline-layout';
import { Orientation } from './utils/position';

@Component({
  selector: 'ngx-chronos-timeline',
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IdleObserverModule,
    ChronTimelinePositionIndicator,
    ChronTimelineCursorTrackbar,
    ChronTimelineLabel,
    ChronTimelineViewport,
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ngx-chronos-timeline',
    role: 'slider',
    tabindex: '0',
    'aria-valuemin': '0',
    'aria-valuemax': '1',
    '[attr.aria-valuenow]': 'this.currentPositionPct()',
    '[attr.aria-label]': 'this.ariaLabel()',
    '[attr.aria-orientation]': 'this.orientation',
    '[attr.orientation]': 'this.orientation',
    '[attr.idle]': 'this.idle.isIdle()',
  },
})
export class NgxChronosTimeline implements OnInit, OnDestroy {
  private readonly injector = inject(Injector);
  private readonly elementRef = inject(ElementRef) as ElementRef<HTMLElement>;
  private readonly idle = inject(IdleObserver);
  private readonly config = inject(ChronTimelineConfig);
  private readonly datePipe = new DatePipe('en');

  private readonly lineSegment = signal(0);

  /**
   * The layout of the timeline, which organizes and displays the timeline segments.
   */
  layout!: TimelineLayout | null;

  /**
   * Manages interactions within the timeline, including cursor movement and events.
   */
  interactionManager!: InteractionManager;

  /**
   * The current position within the timeline in pixel.
   */
  currentPosition!: Signal<number>;

  /**
   * The current position within the timeline as a percentage value (0% to 100%).
   */
  currentPositionPct!: Signal<number>;

  /**
   * A signal that indicates whether the cursor is visible on the timeline.
   */
  isCursorVisible = signal(true);

  /**
   * The position of the cursor trackbar within the timeline in pixel.
   */
  cursorTrackbarPosition!: Signal<number>;

  /**
   * The position for displaying the label within the timeline.
   */
  labelPosition!: Signal<number>;

  /**
   * The text to display as label within the timeline, representing a timestamp.
   */
  labelDisplayText!: Signal<Timestamp | null | undefined>;

  /**
   * The ARIA label for accessibility support in screen readers.
   */
  ariaLabel!: Signal<Timestamp | null | undefined>;

  /**
   * An array of records to display on the timeline.
   */
  @Input({ required: true })
  records!: TimelineSegmentBase[];

  /**
   * A fractional position within the timeline (0 to 1) to set the current position.
   */
  @Input()
  set position(fraction: number) {
    this.interactionManager?.moveByFraction(fraction);
  }

  /**
   * An event emitter that fires when the position within the timeline changes.
   */
  @Output()
  positionChanged = new EventEmitter<number>();

  /**
   * A reference to the ChronTimelineViewport directive.
   */
  @ViewChild(ChronTimelineViewport, { static: true })
  private readonly viewport!: ChronTimelineViewport;

  get orientation() {
    return this.config.orientation;
  }

  ngOnInit() {
    // Compute and update line segment
    this.updateLineSegment();

    this.interactionManager = new InteractionManager({
      ...this.config,
      container: this.elementRef,
      viewport: this.viewport.elementRef,
      distance: this.lineSegment(),
    });

    this.layout = new TimelineLayout({
      maxSpaceAvailable: this.lineSegment(),
      orientation: this.config.orientation,
      segments: this.records,
    });

    runInInjectionContext(this.injector, () => {
      this.currentPosition = computed(() => {
        const pos = this.interactionManager.position();
        return this.calcFinalPos(pos);
      });

      this.cursorTrackbarPosition = computed(() => {
        const pos = this.interactionManager.cursorPos();
        return this.calcFinalPos(pos);
      });

      this.currentPositionPct = computed(() => this.currentPosition() / this.lineSegment());

      this.labelPosition = computed(() => {
        return this.isCursorVisible() ? this.cursorTrackbarPosition() : this.currentPosition();
      });

      this.labelDisplayText = computed(() => {
        if (!this.layout) {
          return null;
        }

        const labelPos = this.labelPosition();
        const label = this.layout.selectSegmentInRange(labelPos);

        return label?.timestamp;
      });

      this.ariaLabel = computed(() => this.datePipe.transform(this.labelDisplayText(), 'MMMM y'));
    });

    // Observe idle changes
    this.idle.observe();

    // Update cursor trackbar visibility based on mousevents
    const cursorVisibility$ = merge(
      this.interactionManager.mousemove$.pipe(tap(() => this.isCursorVisible.set(true))),
      this.interactionManager.mouseleave$.pipe(tap(() => this.isCursorVisible.set(false)))
    );

    cursorVisibility$.subscribe();

    this.interactionManager.detectInteractions();
  }

  ngOnDestroy(): void {
    this.interactionManager.detach();
  }

  private updateLineSegment() {
    const lineSegment = this.calcLineSegment();
    this.lineSegment.set(lineSegment);
  }

  private calcLineSegment() {
    const containerEl = this.elementRef.nativeElement;
    const { orientation } = this.config;
    const { height, width } = containerEl.getBoundingClientRect();
    const distance = orientation === Orientation.Horizontal ? width : height;
    return distance;
  }

  private calcFinalPos(pos: number) {
    const offsets = this.config.offsetStart + this.config.offsetEnd;
    return pos - offsets / 2;
  }
}
