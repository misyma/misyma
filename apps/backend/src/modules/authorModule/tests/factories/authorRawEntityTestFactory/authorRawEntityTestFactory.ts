import { Generator } from '../../../../../common/tests/generator.js';
import { type AuthorRawEntity } from '../../../infrastructure/databases/authorDatabase/tables/authorTable/authorRawEntity.js';

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
