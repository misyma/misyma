import { Generator } from '@common/tests';

import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';

export class UserRawEntityTestFactory {
  public create(input: Partial<UserRawEntity> = {}): UserRawEntity {
    return {
      id: Generator.uuid(),
      email: Generator.email(),
      password: Generator.password(12),
      firstName: Generator.firstName(),
      lastName: Generator.lastName(),
      isEmailVerified: Generator.boolean(),
      ...input,
    };
  }
}
