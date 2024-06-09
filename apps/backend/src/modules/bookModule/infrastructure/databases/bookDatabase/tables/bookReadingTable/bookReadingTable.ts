import { type BookReadingRawEntity } from './bookReadingRawEntity.js';

export const bookReadingTable = 'bookReadings';

export const bookReadingColumns: Record<keyof BookReadingRawEntity, string> = {
  id: `${bookReadingTable}.id`,
  userBookId: `${bookReadingTable}.userBookId`,
  rating: `${bookReadingTable}.rating`,
  comment: `${bookReadingTable}.comment`,
  startedAt: `${bookReadingTable}.startedAt`,
  endedAt: `${bookReadingTable}.endedAt`,
};
