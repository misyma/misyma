import { type AuthorMapper } from './authorMapper.js';
import { Author } from '../../../../../bookModule/domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../databases/bookDatabase/tables/authorTable/authorRawEntity.js';

export class AuthorMapperImpl implements AuthorMapper {
  public mapToDomain(entity: AuthorRawEntity): Author {
    const { id, name, isApproved, createdAt } = entity;

    return new Author({
      id,
      name,
      isApproved,
      createdAt,
    });
  }
}
