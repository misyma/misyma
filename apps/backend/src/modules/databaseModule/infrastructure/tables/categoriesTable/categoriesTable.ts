import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type CategoryRawEntity } from './categoryRawEntity.js';

const tableName = 'categories';

export const categoriesTable: DatabaseTable<CategoryRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    name: `${tableName}.name`,
  },
};
