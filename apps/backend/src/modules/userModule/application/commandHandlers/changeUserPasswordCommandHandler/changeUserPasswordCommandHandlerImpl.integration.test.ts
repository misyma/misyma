import { beforeEach, describe, expect, it } from 'vitest';

import { type ChangeUserPasswordCommandHandler } from './changeUserPasswordCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('ChangeUserPasswordCommandHandlerImpl', () => {
  let commandHandler: ChangeUserPasswordCommandHandler;

  let tokenService: TokenService;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<ChangeUserPasswordCommandHandler>(symbols.changeUserPasswordCommandHandler);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);
  });

  it('throws an error - when resetPasswordToken is invalid', async () => {
    const invalidResetPasswordToken = 'invalidResetPasswordToken';

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword: 'newPassword',
          repeatedNewPassword: 'newPassword',
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
    const resetPasswordToken = tokenService.createToken({});

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword: 'newPassword',
          repeatedNewPassword: 'newPassword',
          resetPasswordToken,
          userId: 'userId',
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User tokens not found.',
        userId: 'userId',
      },
    });
  });

  it('throws an error - when UserTokens were found but resetPasswordToken is different', async () => {
    const resetPasswordToken = tokenService.createToken({
      valid: 'true',
    });

    const user = userTestFactory.create();

    await userTestUtils.createAndPersist({
      input: {
        id: user.getId(),
        email: user.getEmail(),
        password: user.getPassword(),
      },
    });

    await userTestUtils.createAndPersistUserTokens({
      input: {
        userId: user.getId(),
        resetPasswordToken,
      },
    });

    const invalidResetPasswordToken = tokenService.createToken({
      invalid: 'true',
    });

    await expect(
      async () =>
        await commandHandler.execute({
          newPassword: 'newPassword',
          repeatedNewPassword: 'newPassword',
          resetPasswordToken: invalidResetPasswordToken,
          userId: user.getId(),
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
