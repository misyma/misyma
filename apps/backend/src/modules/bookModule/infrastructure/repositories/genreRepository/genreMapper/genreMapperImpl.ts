import { type GenreRawEntity } from '../../../../../databaseModule/infrastructure/tables/genreTable/genreRawEntity.js';
import { Genre } from '../../../../domain/entities/genre/genre.js';

import { type GenreMapper } from './genreMapper.js';

export class GenreMapperImpl implements GenreMapper {
  public mapToDomain(raw: GenreRawEntity): Genre {
    return new Genre({
      id: raw.id,
      name: raw.name,
    });
  }

  public mapToPersistence(domain: Genre): GenreRawEntity {
    return {
      id: domain.getId(),
      name: domain.getName(),
    };
  }
}
