import { TimelineSegmentBase, Timestamp } from 'chronos';
import createJustifiedLayout from 'justified-layout';
import { JustifiedLayoutOptions } from '../photo-layout/options';
import { JustifiedLayoutResult, LayoutBox } from '../photo-layout/result';

export const chronTimelineRecords: TimelineSegmentBase[] = [
  { timestamp: new Date(2019, 2), numRecords: 29 },
  { timestamp: new Date(2019, 3), numRecords: 12 },
  { timestamp: new Date(2019, 5), numRecords: 48 },
  { timestamp: new Date(2019, 8), numRecords: 51 },
  { timestamp: new Date(2019, 9), numRecords: 37 },

  { timestamp: new Date(2022, 0), numRecords: 48 },
  { timestamp: new Date(2022, 1), numRecords: 26 },
  { timestamp: new Date(2022, 2), numRecords: 129 },
  { timestamp: new Date(2022, 4), numRecords: 17 },
  { timestamp: new Date(2022, 7), numRecords: 26 },
  { timestamp: new Date(2022, 8), numRecords: 10 },
  { timestamp: new Date(2022, 9), numRecords: 26 },
  { timestamp: new Date(2022, 11), numRecords: 15 },

  { timestamp: new Date(2023, 0), numRecords: 30 },
  { timestamp: new Date(2023, 1), numRecords: 10 },
  { timestamp: new Date(2023, 2), numRecords: 57 },
  { timestamp: new Date(2023, 5), numRecords: 21 },
];

interface PhotoRecord extends Partial<LayoutBox> {
  aspectRatio: number;
}

interface ComputedPhotoRecord extends LayoutBox {
  aspectRatio: number;
}

export interface PhotoSegment extends JustifiedLayoutResult {
  timestamp: Timestamp;
}

const demoAspectRatios = [0.5, 1.5, 1, 1.8, 0.4, 0.7, 0.9, 1.1, 1.7, 0.75];

const multiplyAspectRatios = (factor: number) => {
  factor = Math.abs(factor);
  return new Array(factor).fill(null).reduce<number[]>((c, _) => [...c, ...demoAspectRatios], []);
};

const photoRecordsAspectRatioMultipliers = [2, 1, 4, 1, 5, 1, 1, 3, 1, 2, 4, 5, 1, 3, 1, 2, 1];

export const getDemoPhotoSegments = (layoutOptions: JustifiedLayoutOptions): PhotoSegment[] => {
  return chronTimelineRecords.map(({ timestamp }, i) => {
    const aspectRatios = multiplyAspectRatios(photoRecordsAspectRatioMultipliers[i]);
    const layout = createJustifiedLayout(aspectRatios, layoutOptions);
    return {
      timestamp,
      ...layout,
    };
  });
};

export const getDemoPhotoSegmentsTimelineMetadata = (
  photoSegments: PhotoSegment[]
): TimelineSegmentBase[] => {
  return photoSegments.map(({ timestamp, boxes }) => ({ timestamp, numRecords: boxes.length }));
};
