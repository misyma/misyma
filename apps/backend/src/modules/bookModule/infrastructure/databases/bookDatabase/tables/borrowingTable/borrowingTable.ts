import { type BorrowingRawEntity } from './borrowingRawEntity.js';

export const borrowingTable = 'borrowings';

export const borrowingColumns: Record<keyof BorrowingRawEntity, string> = {
  id: `${borrowingTable}.id`,
  userBookId: `${borrowingTable}.userBookId`,
  borrower: `${borrowingTable}.borrower`,
  startedAt: `${borrowingTable}.startedAt`,
  endedAt: `${borrowingTable}.endedAt`,
};
