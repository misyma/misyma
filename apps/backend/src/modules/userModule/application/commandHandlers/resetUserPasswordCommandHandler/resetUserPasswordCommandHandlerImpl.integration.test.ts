import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Generator, SpyFactory } from '@common/tests';

import { type ResetUserPasswordCommandHandler } from './resetUserPasswordCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type EmailService } from '../../services/emailService/emailService.js';
import { ResetPasswordEmail } from '../../types/emails/resetPasswordEmail.js';

describe('ResetUserPasswordCommandHandler', () => {
  let commandHandler: ResetUserPasswordCommandHandler;

  let userRepository: UserRepository;

  let emailService: EmailService;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  const spyFactory = new SpyFactory(vi);

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<ResetUserPasswordCommandHandler>(symbols.resetUserPasswordCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userRepository = container.get<UserRepository>(symbols.userRepository);

    emailService = container.get<EmailService>(symbols.emailService);
  });

  afterEach(async () => {
    await userTestUtils.truncate();
  });

  it('returns without performing action - when user does not exist', async () => {
    const nonExistentUserEmail = Generator.email();

    const updateUserSpy = spyFactory.create(userRepository, 'updateUser');

    await commandHandler.execute({
      email: nonExistentUserEmail,
    });

    expect(updateUserSpy).not.toHaveBeenCalled();
  });

  it('sends ResetPasswordEmail', async () => {
    const user = userTestFactory.create();

    await userTestUtils.createAndPersist({
      input: {
        email: user.getEmail(),
        firstName: user.getFirstName(),
        id: user.getId(),
        isEmailVerified: true,
        lastName: user.getLastName(),
        password: user.getPassword(),
      },
    });

    const sendEmailSpy = spyFactory.create(emailService, 'sendEmail');

    await commandHandler.execute({
      email: user.getEmail(),
    });

    expect(sendEmailSpy).toHaveBeenCalledWith(
      new ResetPasswordEmail({
        recipient: user.getEmail(),
        templateData: {
          firstName: user.getFirstName(),
          lastName: user.getLastName(),
          resetPasswordLink: expect.any(String),
        },
      }),
    );
  });

  it('persists ResetPasswordToken', async () => {
    const user = userTestFactory.create();

    const createdUser = await userTestUtils.createAndPersist({
      input: {
        email: user.getEmail(),
        firstName: user.getFirstName(),
        id: user.getId(),
        isEmailVerified: true,
        lastName: user.getLastName(),
        password: user.getPassword(),
      },
    });

    await commandHandler.execute({
      email: user.getEmail(),
    });

    const userTokens = await userTestUtils.findUserTokensByUserId({
      id: createdUser.id,
    });

    expect(userTokens.resetPasswordToken).toBeDefined();
  });
});
