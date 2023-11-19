import { type Author } from '../../../../domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../databases/authorDatabase/tables/authorTable/authorRawEntity.js';

export interface AuthorMapper {
  mapToDomain(rawEntity: AuthorRawEntity): Author;
}
