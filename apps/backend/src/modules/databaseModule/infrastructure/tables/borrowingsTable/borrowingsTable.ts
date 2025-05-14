import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type BorrowingRawEntity } from './borrowingRawEntity.js';

const tableName = 'borrowings';

export const borrowingsTable: DatabaseTable<BorrowingRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    user_book_id: `${tableName}.user_book_id`,
    borrower: `${tableName}.borrower`,
    started_at: `${tableName}.started_at`,
    ended_at: `${tableName}.ended_at`,
  },
};
