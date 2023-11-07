/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { DatePipe, NgFor, NgIf, formatDate } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { merge, tap } from 'rxjs';

import { IdleManager } from 'chronos/idle-manager';

import { ChronTimelineCursorTrackbar } from './directives/cursor-trackbar';
import { ChronTimelinePositionIndicator } from './directives/position-indicator';
import { ChronTimelineLabel } from './directives/timeline-label';
import { ChronTimelineViewport } from './directives/viewport';
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
    NgIf,
    NgFor,
    DatePipe,

    // Internal imports
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
    '[attr.aria-valuenow]': 'this.interactionManager?.positionPct()',
    '[attr.aria-label]': 'this.ariaLabel()',
    '[attr.aria-orientation]': 'this.orientation',
    '[attr.orientation]': 'this.orientation',
  },
})
export class NgxChronosTimeline implements OnInit, OnDestroy, AfterViewInit {
  private readonly injector = inject(Injector);
  private readonly elementRef = inject(ElementRef) as ElementRef<HTMLElement>;

  private readonly idle = inject<IdleManager | null>(IdleManager, {
    optional: true,
    skipSelf: true,
  });

  private readonly config = inject(ChronTimelineConfig);

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
   * A signal that indicates whether the cursor is visible on the timeline.
   */
  isCursorVisible = signal(false);

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

  @HostBinding('class.is-idle')
  get isIdle() {
    return this.idle?.isIdle();
  }

  get orientation() {
    return this.config.orientation;
  }

  // TODO: Maybe use input bindings?
  // TODO: Determine style bindings based on timeline orientation
  layoutStartOffset = 24;
  layoutEndOffset = 24;
  segmentDelimiterWidth = 6;
  segmentGroupLabelSpacing = 20;

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
      lineSegment: this.lineSegment(),
      orientation: this.orientation,
      segments: this.records,
      endOffset: this.layoutEndOffset,
      startOffset: this.layoutStartOffset,
      delimiterWidth: this.segmentDelimiterWidth,
      labelSpacing: this.segmentGroupLabelSpacing,
    });

    runInInjectionContext(this.injector, () => {
      this.interactionManager.positionChanged
        .pipe(
          tap((pos) => this.positionChanged.emit(pos)),
          takeUntilDestroyed()
        )
        .subscribe();

      this.currentPosition = computed(() => {
        const pos = this.interactionManager.position();
        return this.calcFinalPos(pos);
      });

      this.cursorTrackbarPosition = computed(() => {
        const pos = this.interactionManager.cursorPos();
        return this.calcFinalPos(pos);
      });

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

      this.ariaLabel = computed(() => {
        const label = this.labelDisplayText();
        return label ? formatDate(label, 'MMMM y', 'en') : null;
      });
    });

    // Observe idle changes
    this.idle?.observe();

    this.interactionManager.observe();
  }

  ngAfterViewInit(): void {
    this.detectCursorVisibilityChanges();
  }

  ngOnDestroy(): void {
    this.interactionManager.detach();
  }

  private detectCursorVisibilityChanges() {
    // Update cursor trackbar visibility based on mousevents
    const cursorVisibility$ = merge(
      this.interactionManager.mousemove$.pipe(tap(() => this.isCursorVisible.set(true))),
      this.interactionManager.mouseleave$.pipe(tap(() => this.isCursorVisible.set(false)))
    );

    cursorVisibility$.subscribe();
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
    const itemsContainerOffsets = this.layoutStartOffset + this.layoutEndOffset;
    return pos - itemsContainerOffsets / 2;
  }

  private calcLayoutLineSegment() {
    const itemsContainerOffsets = this.layoutStartOffset + this.layoutEndOffset;
    return this.calcLineSegment() - itemsContainerOffsets;
  }
}
