import { beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type ChangeUserPasswordCommandHandler } from './changeUserPasswordCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { type BlacklistTokenTestUtils } from '../../../tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type HashService } from '../../services/hashService/hashService.js';

describe('ChangeUserPasswordCommandHandlerImpl', () => {
  let commandHandler: ChangeUserPasswordCommandHandler;

  let tokenService: TokenService;

  let userTestUtils: UserTestUtils;

  let blacklistTokenTestUtils: BlacklistTokenTestUtils;

  let hashService: HashService;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<ChangeUserPasswordCommandHandler>(symbols.changeUserPasswordCommandHandler);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    hashService = container.get<HashService>(symbols.hashService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    blacklistTokenTestUtils = container.get<BlacklistTokenTestUtils>(testSymbols.blacklistTokenTestUtils);
  });

  it('changes user password', async () => {
    const resetPasswordToken = tokenService.createToken({
      data: {},
      expiresIn: Generator.number(10000, 100000),
    });

    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserTokens({
      input: {
        userId: user.id,
        resetPasswordToken,
      },
    });

    const newPassword = Generator.password();

    await commandHandler.execute({
      newPassword,
      repeatedNewPassword: newPassword,
      resetPasswordToken,
      userId: user.id,
    });

    const updatedUser = await userTestUtils.findById({
      id: user.id,
    });

    const isUpdatedPasswordValid = await hashService.compare({
      plainData: newPassword,
      hashedData: updatedUser?.password,
    });

    expect(isUpdatedPasswordValid).toBe(true);

    const blacklistToken = await blacklistTokenTestUtils.findByToken({
      token: resetPasswordToken,
    });

    expect(blacklistToken.token).toEqual(resetPasswordToken);
  });

  it('throws an error - when a User with given id not found', async () => {
    const resetPasswordToken = tokenService.createToken({
      data: {},
      expiresIn: Generator.number(10000, 100000),
    });

    const newPassword = Generator.password();

    const userId = Generator.uuid();

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken,
          userId,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User not found.',
        userId,
      },
    });
  });

  it('throws an error - when password does not meet the requirements', async () => {
    const resetPasswordToken = tokenService.createToken({
      data: {},
      expiresIn: Generator.number(10000, 100000),
    });

    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserTokens({
      input: {
        userId: user.id,
        resetPasswordToken,
      },
    });

    const newPassword = Generator.alphaString(5);

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken,
          userId: user.id,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
    });
  });

  it('throws an error - when resetPasswordToken is blacklisted', async () => {
    const resetPasswordToken = tokenService.createToken({
      data: {},
      expiresIn: Generator.number(10000, 100000),
    });

    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserTokens({
      input: {
        userId: user.id,
        resetPasswordToken,
      },
    });

    await blacklistTokenTestUtils.createAndPersist({
      input: {
        token: resetPasswordToken,
      },
    });

    const newPassword = Generator.password();

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken,
          userId: user.id,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Reset password token is blacklisted.',
        resetPasswordToken,
      },
    });
  });

  it('throws an error - when passwords do not match', async () => {
    const resetPasswordToken = tokenService.createToken({
      data: {},
      expiresIn: Generator.number(10000, 100000),
    });

    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserTokens({
      input: {
        userId: user.id,
        resetPasswordToken,
      },
    });

    const newPassword = Generator.password();

    const repeatedNewPassword = `repeated${Generator.password()}`;

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword,
          resetPasswordToken,
          userId: user.id,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Passwords do not match.',
      },
    });
  });

  it('throws an error - when resetPasswordToken is invalid', async () => {
    const invalidResetPasswordToken = 'invalidResetPasswordToken';

    const newPassword = Generator.password();

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken: invalidResetPasswordToken,
          userId: 'userId',
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Token is not valid.',
        token: invalidResetPasswordToken,
      },
    });
  });

  it('throws an error - when UserTokens were not found', async () => {
    const resetPasswordToken = tokenService.createToken({
      data: {},
      expiresIn: Generator.number(10000, 100000),
    });

    const user = await userTestUtils.createAndPersist();

    const newPassword = Generator.password();

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken,
          userId: user.id,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User tokens not found.',
        userId: user.id,
      },
    });
  });

  it('throws an error - when UserTokens were found but resetPasswordToken is different', async () => {
    const resetPasswordToken = tokenService.createToken({
      data: { valid: 'true' },
      expiresIn: Generator.number(10000, 100000),
    });

    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserTokens({
      input: {
        userId: user.id,
        resetPasswordToken,
      },
    });

    const invalidResetPasswordToken = tokenService.createToken({
      data: { invalid: 'true' },
      expiresIn: Generator.number(),
    });

    const newPassword = Generator.password();

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken: invalidResetPasswordToken,
          userId: user.id,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Reset password token is not valid.',
        resetPasswordToken: invalidResetPasswordToken,
      },
    });
  });
});
