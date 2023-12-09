import { Generator } from '@common/tests';

import { type Author } from '../../../../bookModule/domain/entities/author/author.js';

export class AuthorTestFactory {
  public create(input: Partial<Author> = {}): Author {
    return {
      id: Generator.uuid(),
      firstName: Generator.firstName(),
      lastName: Generator.lastName(),
      ...input,
    };
  }
}
