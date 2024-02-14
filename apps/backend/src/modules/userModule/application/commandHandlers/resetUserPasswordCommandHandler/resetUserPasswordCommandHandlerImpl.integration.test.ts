import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Generator, SpyFactory } from '@common/tests';

import { type ResetUserPasswordCommandHandler } from './resetUserPasswordCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { EmailEventDraft } from '../../../domain/entities/emailEvent/emailEventDraft.ts/emailEventDraft.js';
import { EmailEventType } from '../../../domain/entities/emailEvent/types/emailEventType.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type EmailMessageBus } from '../../messageBuses/emailMessageBus/emailMessageBus.js';

describe('ResetUserPasswordCommandHandler', () => {
  let commandHandler: ResetUserPasswordCommandHandler;

  let tokenService: TokenService;

  let emailMessageBus: EmailMessageBus;

  let userRepository: UserRepository;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  const spyFactory = new SpyFactory(vi);

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<ResetUserPasswordCommandHandler>(symbols.resetUserPasswordCommandHandler);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userRepository = container.get<UserRepository>(symbols.userRepository);

    emailMessageBus = container.get<EmailMessageBus>(symbols.emailMessageBus);
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
        name: user.getName(),
        id: user.getId(),
        isEmailVerified: true,
        password: user.getPassword(),
      },
    });

    const sendEmailSpy = spyFactory.create(emailMessageBus, 'sendEvent');

    await commandHandler.execute({
      email: user.getEmail(),
    });

    expect(sendEmailSpy).toHaveBeenCalledWith(
      new EmailEventDraft({
        eventName: EmailEventType.resetPassword,
        payload: {
          recipientEmail: user.getEmail(),
          resetPasswordLink: expect.any(String),
          name: user.getName(),
        },
      }),
    );
  });

  it('persists ResetPasswordToken', async () => {
    const user = userTestFactory.create();

    const createdUser = await userTestUtils.createAndPersist({
      input: {
        email: user.getEmail(),
        id: user.getId(),
        isEmailVerified: true,
        name: user.getName(),
        password: user.getPassword(),
      },
    });

    await commandHandler.execute({
      email: user.getEmail(),
    });

    const userTokens = await userTestUtils.findTokensByUserId({
      userId: createdUser.id,
    });

    expect(userTokens.resetPasswordToken).toBeDefined();

    const resetPasswordTokenPayload = tokenService.verifyToken({ token: userTokens.resetPasswordToken! });

    expect(resetPasswordTokenPayload['userId']).toBe(createdUser.id);
  });
});
