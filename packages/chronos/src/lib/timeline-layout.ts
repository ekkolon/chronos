/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { inRange } from './utils/math';
import { Orientation, getTranslate3d } from './utils/position';

// TODO: Add jsdocs for public api

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

  /** Indicates if the segment is a new year. */
  isYear?: boolean;
}

/**
 * Metadata about a fragment within a {@link TimelineLayout}.
 * A fragment represents a month within a year.
 */
export interface TimelineSegment extends TimelineSegmentBase {
  /** An optional label for the segment. */
  label?: string;

  /** The position where the segment starts. */
  startAt: number;

  /** The position where the segment starts. */
  endAt: number;

  /** The transformation data for the segment. */
  transform: string;

  /** The fraction of records compared to the total. */
  fraction: number;
}

export type TimelineYearSegments = TimelineYearSegment[];

export type TimelineYearSegment = {
  /** The year associated with the segment. */
  year: number;

  /** Array of segments within the year. */
  segments: TimelineSegment[];

  /** The first segment of the year. */
  first: TimelineSegment;
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
  labelSpacing: number;
}

/**
 * Manages the layout of timeline segments.
 */
export class TimelineLayout {
  private _segments!: TimelineSegment[];

  private _segmentGroups!: TimelineYearSegments;

  private _numSegmentGroups!: number;

  /**
   * Creates a new instance of the TimelineLayout class.
   * @param config - Configuration options for the layout.
   */
  constructor(private config: TimelineLayoutConfig) {
    this.config.segments = groupAndSortByYear(this.config.segments)
      .map((seg) => {
        seg[seg.length - 1].isYear = true;
        return seg;
      })
      .flat(1);

    this._numSegmentGroups = this.config.segments.filter((s) => s.isYear).length;

    this._segments = this.computeLayout();
    this._segmentGroups = this.groupSegmentsByYear(this._segments);
  }

  /**
   * Gets the array of timeline segments.
   */
  get segments() {
    return this._segments;
  }

  /**
   * Gets the array of timeline year segments.
   */
  get segmentGroups() {
    return this._segmentGroups;
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
    const segments = this._segments;
    const numSegments = segments.length;

    const snapshotInRange = segments.find((snapshot, index) => {
      const itemPosition = snapshot.startAt;

      let upperBound: number;

      if (segments[index + 1] && index !== numSegments - 1) {
        upperBound = segments[index + 1].startAt;
      } else {
        upperBound = segments[numSegments - 1].startAt;
      }

      if (index === numSegments - 1) {
        upperBound = this.maxSpaceAvailable;
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

  private get labelSpacing() {
    return this.config.labelSpacing - this.delimiterRadius;
  }

  private computeLayout() {
    const segments = this.config.segments;

    // The starting point from `top -> down` or `left -> right`, depending on the
    // timeline's orientation setting, must be adjusted such that it takes the
    // radius of it's delimiter into account. Since each segment is seperated by
    // a circle, except segments that mark the start of a segment group
    // (first month of each year), we need to start at the negative circle radius.
    let startAt = -this.delimiterRadius;

    // We account for the sum of radii of all segment delimiters, execpt those that
    // mark the start of a segment group. This is because the start of a segment
    // group is not displayed as a circle but as a text box containing the year
    // of that segment group.
    const maxSpaceAvailable =
      this.maxSpaceAvailable - this.delimiterRadius * this._numSegmentGroups;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const fraction = this.calcFraction(seg.numRecords);
      const occupiedSpace = maxSpaceAvailable * fraction;
      const endAt = startAt + occupiedSpace;

      let transform = endAt - this.delimiterRadius;
      if (seg.isYear && i !== segments.length - 1) {
        // Subtract the label spacing for this segment.
        // We don't account for the last record within the layout because
        // this is already done when calculating the `maxSpaceAvailable`.
        transform = endAt - this.labelSpacing;
      }

      segments[i] = {
        ...seg,
        fraction,
        startAt,
        endAt,
        transform: this.getTranslate3d(transform),
      } as TimelineSegment;

      startAt = endAt;
    }

    return segments as TimelineSegment[];
  }

  private groupSegmentsByYear(segments: TimelineSegment[]): TimelineYearSegments {
    const segmentsMap = groupBy(segments, groupByYear);
    return Object.keys(segmentsMap)
      .map((year) => {
        const segments = segmentsMap[year];
        const first = segments.pop();
        return {
          first,
          segments,
          year: parseInt(year),
        } as TimelineYearSegment;
      })
      .reverse();
  }

  private getTranslate3d(startPosition: number) {
    return getTranslate3d(this.config.orientation, startPosition);
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

function groupAndSortByYear(input: TimelineSegmentBase[]): TimelineSegmentBase[][] {
  // Sort the input array in descending order by timestamp
  const sortedInput = input.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const groupedData: Record<string, TimelineSegmentBase[]> = {};

  // Group the sorted data by year
  for (const item of sortedInput) {
    const year = new Date(item.timestamp).getFullYear().toString();

    if (!groupedData[year]) {
      groupedData[year] = [];
    }

    groupedData[year].push(item);
  }

  // Convert the grouped data into a 2D array and sort it by year in descending order
  const result: TimelineSegmentBase[][] = Object.entries(groupedData)
    .sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10))
    .map((entry) => entry[1]);

  return result;
}
