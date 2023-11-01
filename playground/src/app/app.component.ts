/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import { NgxChronosTimeline, TimelineSegmentBase, provideTimelineConfig } from 'chronos';
import { provideIdleManager } from 'chronos/idle-manager';

import {
  PhotoSegment,
  getDemoPhotoSegments,
  getDemoPhotoSegmentsTimelineMetadata,
} from './mocks/timeline-records';
import { JustifiedLayoutOptions } from './photo-layout/options';
import { JustifiedLayoutResult } from './photo-layout/result';

@Component({
  standalone: true,
  imports: [CommonModule, NgxChronosTimeline],
  selector: 'chronos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [provideTimelineConfig(), provideIdleManager()],
})
export class AppComponent implements OnInit {
  title = 'chronos';

  private readonly elementRef = inject(ElementRef);

  readonly timelinePosition = signal<number>(0);

  readonly aspectRatios = [
    [0.5, 1.5, 1, 1.8, 0.4, 0.7, 0.9, 1.1, 1.7, 2, 2.1],
    [1.2, 1, 0.8, 1.9, 0.6, 1.45, 0.9, 1.1, 1.7, 2, 2.1],
  ];

  @ViewChild('content', { static: true })
  readonly contentRef!: ElementRef<HTMLDivElement>;

  readonly layoutContainerPadding = {
    left: 56,
    right: 56,
    bottom: 0,
    top: 48,
  };

  readonly layoutOptions: JustifiedLayoutOptions = {
    boxSpacing: 4,
    targetRowHeight: 245,
    targetRowHeightTolerance: 0.1,
    containerPadding: this.layoutContainerPadding,
  };

  layout!: JustifiedLayoutResult;

  segments!: PhotoSegment[];

  timelineRecords!: TimelineSegmentBase[];

  get exampleDate() {
    return new Date();
  }

  get segmentWidth() {
    const totalWidth = this.contentRef.nativeElement.getBoundingClientRect().width;
    return totalWidth;
  }

  @HostListener('scroll')
  onContentScroll() {
    const { clientHeight, scrollHeight, scrollTop } = this.getScrollMetadata();
    const totalHeight = scrollHeight - clientHeight;
    const offsetYPct = scrollTop / totalHeight;
    // this.timelinePosition.set(offsetYPct);
  }

  onScrollerNavigate(evt: any) {
    const { clientHeight, scrollHeight } = this.getScrollMetadata();
    const totalHeight = scrollHeight - clientHeight;
    const top = totalHeight * evt.portion;
    this.elementRef?.nativeElement.scroll({ top });
  }

  scrollY = 0;
  scrollSpeed = 1;

  totalContentHeight!: number;

  onScrollerlWheel(e: any) {
    e.preventDefault();
    this.elementRef?.nativeElement.scrollBy({ top: e.deltaY * 3.1618 });
  }

  onPositionChanged(position: number) {
    console.log('Chron:Navigator:Position', position);
    this.elementRef?.nativeElement.scroll({ top: position * this.totalContentHeight });
  }

  ngOnInit(): void {
    this.layoutOptions.containerWidth = this.segmentWidth;

    this.segments = getDemoPhotoSegments(this.layoutOptions);

    const calcTotalScrollHeight = () => {
      return this.segments.reduce((totalHeight, curr) => totalHeight + curr.containerHeight, 0);
    };

    this.totalContentHeight = calcTotalScrollHeight();

    this.timelineRecords = getDemoPhotoSegmentsTimelineMetadata(this.segments);
  }

  private getScrollMetadata() {
    const scrollTop = this.elementRef?.nativeElement.scrollTop ?? 0;
    const scrollHeight = this.elementRef?.nativeElement.scrollHeight ?? 0;
    const clientHeight = this.elementRef?.nativeElement.clientHeight ?? 0;
    return { scrollTop, scrollHeight, clientHeight };
  }
}
