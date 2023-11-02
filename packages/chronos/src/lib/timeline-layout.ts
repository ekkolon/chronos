/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { inRange } from './utils/math';
import { Orientation, getTranslate3d } from './utils/position';

export type Timestamp = string | number | Date;

/**
 * Gets the year from a timestamp (string, number, or Date).
 * @param dateLike - The timestamp to extract the year from.
 * @returns The year as a number.
 */
export const getFullYear = (dateLike: Timestamp) => new Date(dateLike).getFullYear();

/**
 * Extracts the year from a TimelineSegment's timestamp.
 * @param segment - The TimelineSegment to extract the year from.
 * @returns The year as a string.
 */
export const groupByYear = (segment: TimelineSegment) => getFullYear(segment.timestamp).toString();

/**
 * Basic properties of a timeline segment.
 */
export interface TimelineSegmentBase {
  /** The timestamp associated with the segment */
  timestamp: Timestamp;

  /** The number of records in the segment */
  numRecords: number;
}

/**
 * Metadata about a fragment within a {@link TimelineLayout}.
 * A fragment represents a month within a year.
 */
export interface TimelineSegment extends TimelineSegmentBase {
  /** An optional label for the segment. */
  label?: string;

  /** The position where the segment starts. */
  startPosition: number;

  /** The transformation data for the segment. */
  transform: string;

  /** The fraction of records compared to the total. */
  fraction: number;

  /** Indicates if the segment is a new year. */
  isYear: boolean;
}

export type TimelineYearSegments = TimelineYearSegment[];

export type TimelineYearSegment = {
  /** The year associated with the segment. */
  year: number;

  /** Array of segments within the year. */
  records: TimelineSegment[];

  /** The first segment of the year. */
  startMonth: TimelineSegment;
};

/**
 * Configuration options for the {@link TimelineLayout} class.
 */
export interface TimelineLayoutConfig {
  lineSegment: number; // The maximum space available for the layout.
  segments: TimelineSegmentBase[]; // An array of timeline segments.
  orientation: Orientation; // The orientation of the layout (e.g., 'horizontal' or 'vertical').
  startOffset: number;
  endOffset: number;
  delimiterWidth: number;
}

/**
 * Manages the layout of timeline segments.
 */
export class TimelineLayout {
  private _segments!: TimelineYearSegments;

  /**
   * Creates a new instance of the TimelineLayout class.
   * @param config - Configuration options for the layout.
   */
  constructor(private config: TimelineLayoutConfig) {
    this.computeLayout();
  }

  /**
   * Gets the array of timeline year segments.
   */
  get segments() {
    return this._segments;
  }

  /**
   * Calculates the total number of records in all segments.
   */
  get numRecords() {
    return this.config.segments.reduce<number>((count, snapshot) => count + snapshot.numRecords, 0);
  }

  /**
   * Selects a timeline segment within the specified position range.
   * @param position - The position to select a segment.
   * @returns The selected timeline segment or undefined if not found.
   */
  selectSegmentInRange(position: number) {
    const records = this._segments.reduce<TimelineSegment[]>(
      (snaps, year) => [...snaps, year.startMonth, ...year.records],
      []
    );

    const numSnapshots = records.length;
    const snapshotInRange = records.find((snapshot, index) => {
      const itemPosition = snapshot.startPosition;

      let upperBound: number;

      if (records[index + 1] && index !== numSnapshots - 1) {
        upperBound = records[index + 1].startPosition;
      } else {
        upperBound = records[numSnapshots - 1].startPosition;
      }

      if (index === numSnapshots - 1) {
        upperBound = this.config.lineSegment;
      }

      return inRange(position, itemPosition, upperBound);
    });

    return snapshotInRange;
  }

  private get maxSpaceAvailable() {
    return this.config.lineSegment - this.config.startOffset - this.config.endOffset;
  }

  private get delimiterRadius() {
    return this.config.delimiterWidth / 2;
  }

  private computeLayout() {
    const { segments } = this.config;

    const _segments: TimelineSegment[] = [];

    let startYear: number;
    let startPosition = 0;

    segments.forEach((segment, idx) => {
      const fragment = { ...segment } as Partial<TimelineSegment>;
      fragment.startPosition = startPosition;
      fragment.transform = this.getTranslate3d(startPosition);
      fragment.fraction = this.calcFraction(segment.numRecords);

      const fragmentYear = (fragment.timestamp as Date).getFullYear();
      fragment.isYear = !(fragmentYear === startYear);
      startYear = fragmentYear;

      _segments[idx] = fragment as TimelineSegment;

      startPosition += this.maxSpaceAvailable * fragment.fraction;
      startPosition += this.delimiterRadius;
    });

    this._segments = this.splitIntoYearSegments(_segments);
  }

  private splitIntoYearSegments(segments: TimelineSegment[]) {
    const segmentsMap = groupBy(segments, groupByYear);

    const yearSegments: TimelineYearSegments = [];

    for (const year in segmentsMap) {
      const yearSegment = segmentsMap[year];
      const monthSegment = yearSegment.shift();

      if (monthSegment) {
        yearSegments.push({
          startMonth: monthSegment,
          year: parseInt(year),
          records: segmentsMap[year],
        });
      }
    }

    return yearSegments;
  }

  private getTranslate3d(startPosition: number) {
    return getTranslate3d(this.config.orientation, startPosition - this.delimiterRadius);
  }

  private calcFraction(recordsCount: number) {
    return recordsCount / this.numRecords;
  }
}

interface ArrayDict<T = unknown> {
  [key: string]: Array<T>;
}

export type GroupByFn<T> = (item: T) => string;

/**
 * Groups an array of objects by a specified property.
 * @param array - The array of objects to group.
 * @param property - A function that extracts the grouping property from each object.
 * @returns An object where keys are unique property values and values are arrays of objects with the same property value.
 */
export function groupBy<T>(array: Array<T>, property: GroupByFn<T>): ArrayDict<T> {
  return array.reduce((memo: { [key: string]: Array<T> }, x: T) => {
    if (!memo[property(x)]) {
      memo[property(x)] = [];
    }
    memo[property(x)].push(x);
    return memo;
  }, {});
}
