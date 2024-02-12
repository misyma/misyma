import { beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type VerifyUserEmailCommandHandler } from './verifyUserEmailCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('VerifyUserEmailCommandHandlerImpl', () => {
  let commandHandler: VerifyUserEmailCommandHandler;

  let tokenService: TokenService;

  let userTestUtils: UserTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<VerifyUserEmailCommandHandler>(symbols.verifyUserEmailCommandHandler);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);
  });

  it('verifies user email', async () => {
    const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: false } });

    const emailVerificationToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistEmailVerificationToken({
      input: {
        userId: user.id,
        token: emailVerificationToken,
      },
    });

    await commandHandler.execute({ emailVerificationToken });

    const updatedUser = await userTestUtils.findById({
      id: user.id,
    });

    expect(updatedUser?.isEmailVerified).toBe(true);
  });

  it('throws an error - when a User with given id not found', async () => {
    const userId = Generator.uuid();

    const emailVerificationToken = tokenService.createToken({
      data: { userId },
      expiresIn: Generator.number(10000, 100000),
    });

    await expect(async () => await commandHandler.execute({ emailVerificationToken })).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User not found.',
        userId,
      },
    });
  });

  it('throws an error - when emailVerificationToken is invalid', async () => {
    const invalidEmailVerificationToken = 'invalidEmailVerificationToken';

    await expect(
      async () => await commandHandler.execute({ emailVerificationToken: invalidEmailVerificationToken }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Token is not valid.',
        token: invalidEmailVerificationToken,
      },
    });
  });

  it('throws an error - when UserTokens were not found', async () => {
    const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: false } });

    const emailVerificationToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await expect(async () => await commandHandler.execute({ emailVerificationToken })).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User tokens not found.',
        userId: user.id,
      },
    });
  });

  it('throws an error - when UserTokens were found but emailVerificationToken is different', async () => {
    const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: false } });

    const emailVerificationToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistEmailVerificationToken({
      input: {
        userId: user.id,
        token: emailVerificationToken,
      },
    });

    const invalidEmailVerificationToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(),
    });

    await expect(
      async () => await commandHandler.execute({ emailVerificationToken: invalidEmailVerificationToken }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Email verification token is not valid.',
        token: invalidEmailVerificationToken,
      },
    });
  });

  it('throws an error - when UserTokens were found but emailVerificationToken is expired', async () => {
    const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: false } });

    const emailVerificationToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: 0,
    });

    await userTestUtils.createAndPersistEmailVerificationToken({
      input: {
        userId: user.id,
        token: emailVerificationToken,
      },
    });

    await expect(
      async () =>
        await commandHandler.execute({
          emailVerificationToken,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Token is not valid.',
        token: emailVerificationToken,
      },
    });
  });

  it('throws an error - when User is already verified', async () => {
    const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: true } });

    const emailVerificationToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistEmailVerificationToken({
      input: {
        userId: user.id,
        token: emailVerificationToken,
      },
    });

    await expect(
      async () =>
        await commandHandler.execute({
          emailVerificationToken,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'The email is already verified.',
        email: user.email,
      },
    });
  });
});
