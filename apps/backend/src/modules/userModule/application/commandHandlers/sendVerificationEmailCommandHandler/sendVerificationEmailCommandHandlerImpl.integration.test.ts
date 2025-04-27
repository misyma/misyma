import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { emailTypes } from '../../../../../common/types/emailType.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { EmailEventDraft } from '../../../domain/entities/emailEvent/emailEvent.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type EmailMessageBus } from '../../messageBuses/emailMessageBus/emailMessageBus.js';

import { type SendVerificationEmailCommandHandler } from './sendVerificationEmailCommandHandler.js';

describe('SendVerificationEmailCommandHandler', () => {
  let commandHandler: SendVerificationEmailCommandHandler;

  let databaseClient: DatabaseClient;

  let emailMessageBus: EmailMessageBus;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<SendVerificationEmailCommandHandler>(symbols.sendVerificationEmailCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    emailMessageBus = container.get<EmailMessageBus>(symbols.emailMessageBus);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('sends verification email', async () => {
    const user = await userTestUtils.createAndPersist({
      input: {
        isEmailVerified: false,
      },
    });

    const sendEmailSpy = vi.spyOn(emailMessageBus, 'sendEvent');

    await commandHandler.execute({ email: user.email });

    expect(sendEmailSpy).toHaveBeenCalledWith(
      new EmailEventDraft({
        eventName: emailTypes.verifyEmail,
        payload: {
          recipientEmail: user.email,
          emailVerificationLink: expect.any(String),
          name: user.name,
        },
      }),
    );
  });

  it('throws an error - when user not found', async () => {
    const email = Generator.email();

    try {
      await commandHandler.execute({ email });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User not found.',
        email,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when user is already verified', async () => {
    const user = await userTestUtils.createAndPersist({
      input: {
        isEmailVerified: true,
      },
    });

    try {
      await commandHandler.execute({ email: user.email });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User email is already verified.',
        email: user.email,
      });

      return;
    }

    expect.fail();
  });
});
