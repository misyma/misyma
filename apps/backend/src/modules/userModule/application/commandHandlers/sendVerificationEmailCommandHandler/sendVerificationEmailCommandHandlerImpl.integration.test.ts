import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SpyFactory } from '@common/tests';

import { type SendVerificationEmailCommandHandler } from './sendVerificationEmailCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type EmailService } from '../../services/emailService/emailService.js';
import { VerificationEmail } from '../../types/emails/verificationEmail.js';

describe('SendVerificationEmailCommandHandlerImpl', () => {
  let commandHandler: SendVerificationEmailCommandHandler;

  let emailService: EmailService;

  let userRepository: UserRepository;

  let userTestUtils: UserTestUtils;

  const spyFactory = new SpyFactory(vi);

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<SendVerificationEmailCommandHandler>(symbols.sendVerificationEmailCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userRepository = container.get<UserRepository>(symbols.userRepository);

    emailService = container.get<EmailService>(symbols.emailService);
  });

  it('returns and does nothing - when User was not found', async () => {
    const userId = 'userId';

    const updateUserSpy = spyFactory.create(userRepository, 'updateUser');

    await commandHandler.execute({
      userId,
    });

    expect(updateUserSpy).not.toHaveBeenCalled();
  });

  it('sends VerificationEmail', async () => {
    const user = await userTestUtils.createAndPersist();

    const sendEmailSpy = spyFactory.create(emailService, 'sendEmail');

    await commandHandler.execute({
      userId: user.id,
    });

    expect(sendEmailSpy).toHaveBeenCalledWith(
      new VerificationEmail({
        recipient: user.email,
        templateData: {
          emailVerificationLink: expect.any(String),
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }),
    );
  });

  it('persists EmailVerificationToken', async () => {
    const user = await userTestUtils.createAndPersist();

    await commandHandler.execute({
      userId: user.id,
    });

    const userTokens = await userTestUtils.findUserTokensByUserId({
      id: user.id,
    });

    expect(userTokens.emailVerificationToken).toBeDefined();
  });
});
