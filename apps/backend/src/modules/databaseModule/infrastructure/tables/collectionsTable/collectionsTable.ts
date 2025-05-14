import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type CollectionRawEntity } from './collectionRawEntity.js';

const tableName = 'collections';

export const collectionsTable: DatabaseTable<CollectionRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    name: `${tableName}.name`,
    user_id: `${tableName}.user_id`,
    created_at: `${tableName}.created_at`,
  },
};
