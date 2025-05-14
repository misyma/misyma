import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type AuthorRawEntity } from './authorRawEntity.js';

const tableName = 'authors';

export const authorsTable: DatabaseTable<AuthorRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    name: `${tableName}.name`,
    is_approved: `${tableName}.is_approved`,
  },
};
