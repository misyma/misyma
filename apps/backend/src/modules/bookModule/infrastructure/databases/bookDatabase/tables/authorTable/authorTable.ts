import { type AuthorRawEntity } from './authorRawEntity.js';

export const authorTable = 'authors';

export const authorColumns: Record<keyof AuthorRawEntity, string> = {
  id: `${authorTable}.id`,
  name: `${authorTable}.name`,
  isApproved: `${authorTable}.isApproved`,
};
