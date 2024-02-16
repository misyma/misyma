import { type Genre } from '../../../../domain/entities/genre/genre.js';
import { type GenreRawEntity } from '../../../databases/bookDatabase/tables/genreTable/genreRawEntity.js';

export interface GenreMapper {
  toDomain(raw: GenreRawEntity): Genre;
  toPersistence(domain: Genre): GenreRawEntity;
}
