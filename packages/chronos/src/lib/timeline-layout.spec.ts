import {
  TimelineLayout,
  TimelineLayoutConfig,
  TimelineSegment,
  TimelineSegmentBase,
  TimelineYearSegment,
  getFullYear,
  groupBy,
  groupByYear,
} from './timeline-layout';

describe('getFullYear', () => {
  it('should correctly extract the year from a string timestamp', () => {
    const year = getFullYear('2022-10-30');
    expect(year).toBe(2022);
  });

  it('should correctly extract the year from a number timestamp', () => {
    const year = getFullYear(1677686400000); // Equivalent to '2023-02-21'
    expect(year).toBe(2023);
  });

  it('should correctly extract the year from a Date object', () => {
    const date = new Date('2024-12-15');
    const year = getFullYear(date);
    expect(year).toBe(2024);
  });
});

describe('groupByYear', () => {
  it('should return the year as a string for a TimelineSegment', () => {
    const segment: TimelineSegment = {
      timestamp: '2023-11-25',
      numRecords: 10,
      label: 'November 2023',
      startAt: 0,
      transform: 'translate3d(0, 0, 0)',
      fraction: 0.5,
      isYear: false,
      endAt: 1000,
    };

    const yearString = groupByYear(segment);
    expect(yearString).toBe('2023');
  });
});

describe('group', () => {
  it('should group an array of objects by a specified property', () => {
    const array = [
      { id: 'A', value: 10 },
      { id: 'B', value: 20 },
      { id: 'A', value: 30 },
    ];

    const grouped = groupBy(array, (x) => x.id);

    expect(grouped['A']).toEqual([
      { id: 'A', value: 10 },
      { id: 'A', value: 30 },
    ]);
    expect(grouped['B']).toEqual([{ id: 'B', value: 20 }]);
  });
});

describe('TimelineLayout', () => {
  let sampleSegments: TimelineSegmentBase[];
  let config: TimelineLayoutConfig;

  beforeEach(() => {
    // Sample data for testing
    sampleSegments = [
      { timestamp: new Date('2022-10-30'), numRecords: 5 },
      { timestamp: new Date('2023-02-15'), numRecords: 3 },
      { timestamp: new Date('2024-01-01'), numRecords: 8 },
    ];

    config = {
      lineSegment: 1000,
      segments: sampleSegments,
      orientation: 'vertical' as never,
      delimiterWidth: 6,
      endOffset: 24,
      startOffset: 24,
      labelSpacing: 20,
    };
  });

  it('should calculate numRecords correctly', () => {
    const timelineLayout = new TimelineLayout(config);
    expect(timelineLayout.numRecords).toBe(16); // 5 + 3 + 8
  });

  it('should select the correct segment within a range', () => {
    const timelineLayout = new TimelineLayout(config);
    const selectedSegment = timelineLayout.selectSegmentInRange(300);

    expect(selectedSegment).not.toBeNull();
    expect(selectedSegment?.numRecords).toBe(8); // Check if it's one of the sample segments
  });

  it('should group segments into year segments', () => {
    const timelineLayout = new TimelineLayout(config);
    const yearSegments: TimelineYearSegment[] = timelineLayout.segmentGroups;

    // Three different years
    expect(yearSegments.length).toBe(3);
    expect(yearSegments[2].year).toBe(2022);
    expect(yearSegments[1].year).toBe(2023);
    expect(yearSegments[0].year).toBe(2024);
  });
});
