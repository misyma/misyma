import { type BookAuthorRawEntity } from './bookAuthorRawEntity.js';

export const bookAuthorTable = 'booksAuthors';

export const bookAuthorColumns: Record<keyof BookAuthorRawEntity, string> = {
  authorId: `${bookAuthorTable}.authorId`,
  bookId: `${bookAuthorTable}.bookId`,
};
