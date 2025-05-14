import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type BookAuthorRawEntity } from './bookAuthorRawEntity.js';

const tableName = 'books_authors';

export const booksAuthorsTable: DatabaseTable<BookAuthorRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    author_id: `${tableName}.author_id`,
    book_id: `${tableName}.book_id`,
  },
};
