import { type UserBookGenreRawEntity } from './userBookGenresRawEntity.js';

export const userBookGenreTable = 'userBookGenres';

export const userBookGenreColumns: Record<keyof UserBookGenreRawEntity, string> = {
  genreId: `${userBookGenreTable}.genreId`,
  userBookId: `${userBookGenreTable}.userBookId`,
};
