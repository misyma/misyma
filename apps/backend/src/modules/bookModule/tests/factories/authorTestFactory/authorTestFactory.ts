import { Generator } from '../../../../../../tests/generator.js';
import { type AuthorRawEntity } from '../../../../databaseModule/infrastructure/tables/authorsTable/authorRawEntity.js';
import { type AuthorDraft, Author } from '../../../domain/entities/author/author.js';

export class AuthorTestFactory {
  public createRaw(input: Partial<AuthorRawEntity> = {}): AuthorRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.author(),
      is_approved: Generator.boolean(),
      ...input,
    };
  }

  public create(input: Partial<AuthorDraft> = {}): Author {
    return new Author({
      id: Generator.uuid(),
      name: Generator.author(),
      isApproved: Generator.boolean(),
      ...input,
    });
  }
}
