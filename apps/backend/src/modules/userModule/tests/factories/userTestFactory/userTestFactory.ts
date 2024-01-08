import { Generator } from '@common/tests';

import { User, type UserDraft } from '../../../domain/entities/user/user.js';

export class UserTestFactory {
  public create(input: Partial<UserDraft> = {}): User {
    const email = Generator.email().toLowerCase();

    return new User({
      id: Generator.uuid(),
      email,
      password: Generator.password(),
      firstName: Generator.firstName(),
      lastName: Generator.lastName(),
      isEmailVerified: Generator.boolean(),
      ...input,
    });
  }
}
