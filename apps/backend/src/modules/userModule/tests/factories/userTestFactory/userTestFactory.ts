import { Generator } from '@common/tests';

import { User } from '../../../domain/entities/user/user.js';

export class UserTestFactory {
  public create(input: Partial<User> = {}): User {
    return new User({
      id: Generator.uuid(),
      email: Generator.email(),
      password: Generator.password(12),
      firstName: Generator.firstName(),
      lastName: Generator.lastName(),
      ...input,
    });
  }
}
