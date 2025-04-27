import { type GenreRawEntity } from '../../../../../databaseModule/infrastructure/tables/genreTable/genreRawEntity.js';
import { type Genre } from '../../../../domain/entities/genre/genre.js';

export interface GenreMapper {
  mapToDomain(raw: GenreRawEntity): Genre;
  mapToPersistence(domain: Genre): GenreRawEntity;
}
