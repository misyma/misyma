import { Generator } from '@common/tests';

import {
  type EmailVerificationTokenDraft,
  EmailVerificationToken,
} from '../../../domain/entities/emailVerificationToken/emailVerificationToken.js';

export class EmailVerificationTokenTestFactory {
  public create(input: Partial<EmailVerificationTokenDraft> = {}): EmailVerificationToken {
    return new EmailVerificationToken({
      id: Generator.uuid(),
      userId: Generator.uuid(),
      token: Generator.alphaString(32),
      expiresAt: Generator.futureDate(),
      ...input,
    });
  }
}
