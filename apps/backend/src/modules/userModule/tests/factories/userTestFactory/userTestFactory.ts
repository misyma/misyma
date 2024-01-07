import { Generator } from '@common/tests';

import { User, type UserDraft } from '../../../domain/entities/user/user.js';

export class UserTestFactory {
  public create(input: Partial<UserDraft> = {}): User {
    let password = Generator.password();

    password += Generator.alphaString(1, 'upper');

    password += Generator.alphaString(1, 'lower');

    password += Generator.numericString(1);

    const email = Generator.email().toLowerCase();

    return new User({
      id: Generator.uuid(),
      email,
      password,
      firstName: Generator.firstName(),
      lastName: Generator.lastName(),
      isEmailVerified: Generator.boolean(),
      ...input,
    });
  }
}
