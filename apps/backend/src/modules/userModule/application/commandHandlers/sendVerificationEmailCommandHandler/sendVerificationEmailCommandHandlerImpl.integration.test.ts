import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SpyFactory } from '@common/tests';

import { type SendVerificationEmailCommandHandler } from './sendVerificationEmailCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { EmailEventStatus } from '../../../domain/entities/emailEvent/types/emailEventStatus.js';
import { EmailEventType } from '../../../domain/entities/emailEvent/types/emailEventType.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { symbols } from '../../../symbols.js';
import { type EmailEventTestUtils } from '../../../tests/utils/emailEventTestUtils/emailEventTestUtils.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('SendVerificationEmailCommandHandlerImpl', () => {
  let commandHandler: SendVerificationEmailCommandHandler;

  let userRepository: UserRepository;

  let userTestUtils: UserTestUtils;

  let emailEventTestUtils: EmailEventTestUtils;

  const spyFactory = new SpyFactory(vi);

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<SendVerificationEmailCommandHandler>(symbols.sendVerificationEmailCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    emailEventTestUtils = container.get<EmailEventTestUtils>(testSymbols.emailEventTestUtils);

    userRepository = container.get<UserRepository>(symbols.userRepository);
  });

  it('returns and does nothing - when User was not found', async () => {
    const userId = 'userId';

    const updateUserSpy = spyFactory.create(userRepository, 'updateUser');

    await commandHandler.execute({
      userId,
    });

    expect(updateUserSpy).not.toHaveBeenCalled();
  });

  it('creates an EmailEvent', async () => {
    await emailEventTestUtils.truncate();

    const user = await userTestUtils.createAndPersist();

    await commandHandler.execute({
      userId: user.id,
    });

    const createdEmailEvent = await emailEventTestUtils.findAll();

    expect(createdEmailEvent).toHaveLength(1);

    expect(createdEmailEvent[0]).toMatchObject({
      eventName: EmailEventType.verifyEmail,
      id: expect.any(String),
      status: EmailEventStatus.pending,
    });

    const emailEventPayload = createdEmailEvent[0]?.payload;

    expect(JSON.parse(emailEventPayload as unknown as string)).toEqual({
      emailVerificationLink: expect.any(String),
      firstName: user.firstName,
      lastName: user.lastName,
      recipientEmail: user.email,
    });
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
