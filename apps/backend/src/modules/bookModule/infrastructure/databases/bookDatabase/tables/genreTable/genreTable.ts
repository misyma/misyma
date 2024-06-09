import { type GenreRawEntity } from './genreRawEntity.js';

export const genreTable = 'genres';

export const genreColumns: Record<keyof GenreRawEntity, string> = {
  id: `${genreTable}.id`,
  name: `${genreTable}.name`,
};
