import { beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type ChangeUserPasswordCommandHandler } from './changeUserPasswordCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type HashService } from '../../services/hashService/hashService.js';

describe('ChangeUserPasswordCommandHandlerImpl', () => {
  let commandHandler: ChangeUserPasswordCommandHandler;

  let tokenService: TokenService;

  let userTestUtils: UserTestUtils;

  let hashService: HashService;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<ChangeUserPasswordCommandHandler>(symbols.changeUserPasswordCommandHandler);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    hashService = container.get<HashService>(symbols.hashService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);
  });

  it('changes user password', async () => {
    const user = await userTestUtils.createAndPersist();

    const resetPasswordToken = tokenService.createToken({
      data: {
        userId: user.id,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistResetPasswordToken({
      input: {
        userId: user.id,
        token: resetPasswordToken,
      },
    });

    const newPassword = Generator.password();

    await commandHandler.execute({
      newPassword,
      repeatedNewPassword: newPassword,
      resetPasswordToken,
    });

    const updatedUser = await userTestUtils.findById({
      id: user.id,
    });

    const isUpdatedPasswordValid = await hashService.compare({
      plainData: newPassword,
      hashedData: updatedUser?.password as string,
    });

    expect(isUpdatedPasswordValid).toBe(true);
  });

  it('throws an error - when a User with given id not found', async () => {
    const newPassword = Generator.password();

    const userId = Generator.uuid();

    const resetPasswordToken = tokenService.createToken({
      data: {
        userId,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken,
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
    const user = await userTestUtils.createAndPersist();

    const resetPasswordToken = tokenService.createToken({
      data: {
        userId: user.id,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistResetPasswordToken({
      input: {
        userId: user.id,
        token: resetPasswordToken,
      },
    });

    const newPassword = Generator.alphaString(5);

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
    });
  });

  it('throws an error - when passwords do not match', async () => {
    const user = await userTestUtils.createAndPersist();

    const resetPasswordToken = tokenService.createToken({
      data: {
        userId: user.id,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistResetPasswordToken({
      input: {
        userId: user.id,
        token: resetPasswordToken,
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
    const user = await userTestUtils.createAndPersist();

    const resetPasswordToken = tokenService.createToken({
      data: {
        userId: user.id,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    const newPassword = Generator.password();

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken,
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
    const user = await userTestUtils.createAndPersist();

    const resetPasswordToken = tokenService.createToken({
      data: {
        userId: user.id,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    await userTestUtils.createAndPersistResetPasswordToken({
      input: {
        userId: user.id,
        token: resetPasswordToken,
      },
    });

    const invalidResetPasswordToken = tokenService.createToken({
      data: {
        invalid: 'true',
        userId: user.id,
      },
      expiresIn: Generator.number(),
    });

    const newPassword = Generator.password();

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword,
          repeatedNewPassword: newPassword,
          resetPasswordToken: invalidResetPasswordToken,
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
