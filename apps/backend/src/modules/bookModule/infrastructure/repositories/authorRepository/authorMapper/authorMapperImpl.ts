import { Author } from '../../../../../bookModule/domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../../../databaseModule/infrastructure/tables/authorTable/authorRawEntity.js';

import { type AuthorMapper } from './authorMapper.js';

export class AuthorMapperImpl implements AuthorMapper {
  public mapToDomain(entity: AuthorRawEntity): Author {
    const { id, name, is_approved: isApproved } = entity;

    return new Author({
      id,
      name,
      isApproved,
    });
  }
}
