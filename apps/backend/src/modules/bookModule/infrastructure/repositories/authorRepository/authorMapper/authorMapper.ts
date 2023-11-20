import { type Author } from '../../../../../bookModule/domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../../../bookModule/infrastructure/databases/bookDatabase/tables/authorTable/authorRawEntity.js';

export interface AuthorMapper {
  mapToDomain(rawEntity: AuthorRawEntity): Author;
}
