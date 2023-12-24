import { Generator } from '@common/tests';

import { UserTokens, type UserTokensDraft } from '../../../domain/entities/userTokens/userTokens.js';

export class UserTokensTestFactory {
  public create(input: Partial<UserTokensDraft> = {}): UserTokens {
    return new UserTokens({
      id: Generator.uuid(),
      userId: Generator.uuid(),
      refreshToken: Generator.alphanumericString(32),
      resetPasswordToken: Generator.alphanumericString(32),
      emailVerificationToken: Generator.alphanumericString(32),
      ...input,
    });
  }
}
