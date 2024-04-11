import { Generator } from '@common/tests';

import { type AuthorDraft, Author } from '../../../../authorModule/domain/entities/author/author.js';
import { type AuthorRawEntity } from '../../../infrastructure/databases/tables/authorTable/authorRawEntity.js';

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
