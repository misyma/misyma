import { Generator } from '@common/tests';

import { type AuthorRawEntity } from '../../../../bookModule/infrastructure/databases/bookDatabase/tables/authorTable/authorRawEntity.js';

export class AuthorRawEntityTestFactory {
  public create(input: Partial<AuthorRawEntity> = {}): AuthorRawEntity {
    return {
      id: Generator.uuid(),
      firstName: Generator.firstName(),
      lastName: Generator.lastName(),
      ...input,
    };
  }
}
