import { type Author } from '../../../../../bookModule/domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../../../databaseModule/infrastructure/tables/authorsTable/authorRawEntity.js';

export interface AuthorMapper {
  mapToDomain(rawEntity: AuthorRawEntity): Author;
}
