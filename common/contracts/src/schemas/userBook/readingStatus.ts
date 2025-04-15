export const readingStatuses = {
  toRead: 'toRead',
  inProgress: 'inProgress',
  finished: 'finished',
} as const;

export type ReadingStatus = (typeof readingStatuses)[keyof typeof readingStatuses];
