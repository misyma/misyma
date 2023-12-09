import { Generator } from '@common/tests';

import { type User } from '../../../domain/entities/user/user.js';

export class UserTestFactory {
  public create(input: Partial<User> = {}): User {
    return {
      id: Generator.uuid(),
      email: Generator.email(),
      password: Generator.password(12),
      ...input,
    };
  }
}
