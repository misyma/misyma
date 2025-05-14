import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type BookshelfRawEntity } from './bookshelfRawEntity.js';

const tableName = 'bookshelves';

export const bookshelvesTable: DatabaseTable<BookshelfRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    name: `${tableName}.name`,
    user_id: `${tableName}.user_id`,
    type: `${tableName}.type`,
    image_url: `${tableName}.image_url`,
    created_at: `${tableName}.created_at`,
  },
};
