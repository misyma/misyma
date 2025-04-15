import { readingStatuses } from '@common/contracts';

export const ReadingStatus = {
  [readingStatuses.finished]: 'przeczytana',
  [readingStatuses.inProgress]: 'czytana',
  [readingStatuses.toRead]: 'do przeczytania',
} as const;
