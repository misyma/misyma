import { Generator } from '@common/tests';

import { type AuthorDraft, Author } from '../../../../authorModule/domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../infrastructure/databases/tables/authorTable/authorRawEntity.js';

export class AuthorTestFactory {
  public createRaw(input: Partial<AuthorRawEntity> = {}): AuthorRawEntity {
    return {
      id: Generator.uuid(),
      firstName: Generator.firstName(),
      lastName: Generator.lastName(),
      ...input,
    };
  }

  public create(input: Partial<AuthorDraft> = {}): Author {
    return new Author({
      id: Generator.uuid(),
      firstName: Generator.firstName(),
      lastName: Generator.lastName(),
      ...input,
    });
  }
}
