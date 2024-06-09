import { type BookRawEntity } from './bookRawEntity.js';

export const bookTable = 'books';

export const bookColumns: Record<keyof BookRawEntity, string> = {
  id: `${bookTable}.id`,
  title: `${bookTable}.title`,
  isbn: `${bookTable}.isbn`,
  publisher: `${bookTable}.publisher`,
  releaseYear: `${bookTable}.releaseYear`,
  language: `${bookTable}.language`,
  translator: `${bookTable}.translator`,
  format: `${bookTable}.format`,
  pages: `${bookTable}.pages`,
  isApproved: `${bookTable}.isApproved`,
  imageUrl: `${bookTable}.imageUrl`,
};
