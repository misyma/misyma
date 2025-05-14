import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type QuoteRawEntity } from './quoteRawEntity.js';

const tableName = 'quotes';

export const quotesTable: DatabaseTable<QuoteRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    page: `${tableName}.page`,
    content: `${tableName}.content`,
    user_book_id: `${tableName}.user_book_id`,
    created_at: `${tableName}.created_at`,
    is_favorite: `${tableName}.is_favorite`,
  },
};
