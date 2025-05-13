import { type DatabaseTable } from '../../../types/databaseTable.js';

import { type UserRawEntity } from './userRawEntity.js';

const tableName = 'users';

export const usersTable: DatabaseTable<UserRawEntity, typeof tableName> = {
  name: tableName,
  allColumns: `${tableName}.*`,
  columns: {
    id: `${tableName}.id`,
    email: `${tableName}.email`,
    name: `${tableName}.name`,
    password: `${tableName}.password`,
    is_email_verified: `${tableName}.is_email_verified`,
    role: `${tableName}.role`,
  },
};
