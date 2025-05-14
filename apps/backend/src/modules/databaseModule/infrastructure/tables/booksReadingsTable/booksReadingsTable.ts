import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type BookReadingRawEntity } from './bookReadingRawEntity.js';

const tableName = 'books_readings';

export const booksReadingsTable: DatabaseTable<BookReadingRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    rating: `${tableName}.rating`,
    comment: `${tableName}.comment`,
    started_at: `${tableName}.started_at`,
    ended_at: `${tableName}.ended_at`,
    user_book_id: `${tableName}.user_book_id`,
  },
};
