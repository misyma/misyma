import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type BookRawEntity } from './bookRawEntity.js';

const tableName = 'books';

export const booksTable: DatabaseTable<BookRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    title: `${tableName}.title`,
    isbn: `${tableName}.isbn`,
    category_id: `${tableName}.category_id`,
    publisher: `${tableName}.publisher`,
    release_year: `${tableName}.release_year`,
    format: `${tableName}.format`,
    pages: `${tableName}.pages`,
    image_url: `${tableName}.image_url`,
    is_approved: `${tableName}.is_approved`,
    language: `${tableName}.language`,
    translator: `${tableName}.translator`,
  },
};
