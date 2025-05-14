import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type UserBookRawEntity } from './userBookRawEntity.js';

const tableName = 'users_books';

export const usersBooksTable: DatabaseTable<UserBookRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    book_id: `${tableName}.book_id`,
    bookshelf_id: `${tableName}.bookshelf_id`,
    status: `${tableName}.status`,
    image_url: `${tableName}.image_url`,
    is_favorite: `${tableName}.is_favorite`,
    created_at: `${tableName}.created_at`,
  },
};
