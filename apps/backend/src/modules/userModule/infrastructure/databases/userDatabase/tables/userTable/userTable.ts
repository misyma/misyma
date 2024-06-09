import { type UserRawEntity } from './userRawEntity.js';

export const userTable = 'users';

export const userColumns: Record<keyof UserRawEntity, string> = {
  id: `${userTable}.id`,
  email: `${userTable}.email`,
  password: `${userTable}.password`,
  name: `${userTable}.name`,
  isEmailVerified: `${userTable}.isEmailVerified`,
  role: `${userTable}.role`,
};
