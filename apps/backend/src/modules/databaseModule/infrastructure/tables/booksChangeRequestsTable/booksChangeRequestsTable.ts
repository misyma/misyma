import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type BookChangeRequestRawEntity } from './bookChangeRequestRawEntity.js';

const tableName = 'books_change_requests';

export const booksChangeRequestsTable: DatabaseTable<BookChangeRequestRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    title: `${tableName}.title`,
    isbn: `${tableName}.isbn`,
    publisher: `${tableName}.publisher`,
    release_year: `${tableName}.release_year`,
    language: `${tableName}.language`,
    translator: `${tableName}.translator`,
    format: `${tableName}.format`,
    pages: `${tableName}.pages`,
    image_url: `${tableName}.image_url`,
    author_ids: `${tableName}.author_ids`,
    book_id: `${tableName}.book_id`,
    user_email: `${tableName}.user_email`,
    created_at: `${tableName}.created_at`,
    changed_fields: `${tableName}.changed_fields`,
  },
};
