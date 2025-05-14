import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type UserBookCollectionRawEntity } from './userBookCollectionsRawEntity.js';

const tableName = 'users_books_collections';

export const usersBooksCollectionsTable: DatabaseTable<UserBookCollectionRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    user_book_id: `${tableName}.user_book_id`,
    collection_id: `${tableName}.collection_id`,
  },
};
