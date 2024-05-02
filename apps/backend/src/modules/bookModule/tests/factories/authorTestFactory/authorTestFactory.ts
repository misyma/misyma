import { Generator } from '../../../../../../tests/generator.js';
import { type AuthorDraft, Author } from '../../../domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/authorTable/authorRawEntity.js';

export class AuthorTestFactory {
  public createRaw(input: Partial<AuthorRawEntity> = {}): AuthorRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.fullName(),
      isApproved: Generator.boolean(),
      ...input,
    };
  }

  public create(input: Partial<AuthorDraft> = {}): Author {
    return new Author({
      id: Generator.uuid(),
      name: Generator.fullName(),
      isApproved: Generator.boolean(),
      ...input,
    });
  }
}
