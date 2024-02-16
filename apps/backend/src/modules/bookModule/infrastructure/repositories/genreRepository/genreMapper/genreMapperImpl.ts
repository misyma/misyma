import { type GenreMapper } from './genreMapper.js';
import { Genre } from '../../../../domain/entities/genre/genre.js';
import { type GenreRawEntity } from '../../../databases/bookDatabase/tables/genreTable/genreRawEntity.js';

export class GenreMapperImpl implements GenreMapper {
  public toDomain(raw: GenreRawEntity): Genre {
    return new Genre({
      id: raw.id,
      name: raw.name,
    });
  }

  public toPersistence(domain: Genre): GenreRawEntity {
    return {
      id: domain.getId(),
      name: domain.getName(),
    };
  }
}
