import { Generator } from '@common/tests';

import {
  type ResetPasswordTokenDraft,
  ResetPasswordToken,
} from '../../../domain/entities/resetPasswordToken/resetPasswordToken.js';

export class ResetPasswordTokenTestFactory {
  public create(input: Partial<ResetPasswordTokenDraft> = {}): ResetPasswordToken {
    return new ResetPasswordToken({
      id: Generator.uuid(),
      userId: Generator.uuid(),
      token: Generator.alphaString(32),
      expiresAt: Generator.futureDate(),
      ...input,
    });
  }
}
