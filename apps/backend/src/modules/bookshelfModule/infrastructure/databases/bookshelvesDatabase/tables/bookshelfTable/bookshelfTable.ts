import { type BookshelfRawEntity } from './bookshelfRawEntity.js';

export const bookshelfTable = 'bookshelves';

export const bookshelfColumns: Record<keyof BookshelfRawEntity, string> = {
  id: `${bookshelfTable}.id`,
  name: `${bookshelfTable}.name`,
  userId: `${bookshelfTable}.userId`,
  type: `${bookshelfTable}.type`,
  createdAt: `${bookshelfTable}.createdAt`,
};
