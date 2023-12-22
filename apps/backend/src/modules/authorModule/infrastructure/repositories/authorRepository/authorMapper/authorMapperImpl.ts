import { type AuthorMapper } from './authorMapper.js';
import { Author } from '../../../../domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../databases/tables/authorTable/authorRawEntity.js';

export class AuthorMapperImpl implements AuthorMapper {
  public mapToDomain(entity: AuthorRawEntity): Author {
    const { id, firstName, lastName } = entity;

    return new Author({
      id,
      firstName,
      lastName,
    });
  }
}
