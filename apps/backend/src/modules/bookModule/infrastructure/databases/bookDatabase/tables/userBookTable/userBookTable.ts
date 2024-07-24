import { type UserBookRawEntity } from './userBookRawEntity.js';

export const userBookTable = 'userBooks';

// TODO: remove all columns vars
export const userBookColumns: Record<keyof UserBookRawEntity, string> = {
  id: `${userBookTable}.id`,
  imageUrl: `${userBookTable}.imageUrl`,
  status: `${userBookTable}.status`,
  isFavorite: `${userBookTable}.isFavorite`,
  bookId: `${userBookTable}.bookId`,
  bookshelfId: `${userBookTable}.bookshelfId`,
  createdAt: `${userBookTable}.createdAt`,
};
