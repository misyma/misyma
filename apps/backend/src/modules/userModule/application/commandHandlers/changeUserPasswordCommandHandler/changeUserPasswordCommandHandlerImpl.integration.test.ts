import { beforeEach, describe, expect, it, afterEach } from 'vitest';

import { type ChangeUserPasswordCommandHandler } from './changeUserPasswordCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { TokenType } from '../../../../../common/types/tokenType.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type HashService } from '../../services/hashService/hashService.js';

describe('ChangeUserPasswordCommandHandlerImpl', () => {
  let commandHandler: ChangeUserPasswordCommandHandler;

  let databaseClient: DatabaseClient;

  let tokenService: TokenService;

  let userTestUtils: UserTestUtils;

  let hashService: HashService;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<ChangeUserPasswordCommandHandler>(symbols.changeUserPasswordCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    hashService = container.get<HashService>(symbols.hashService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  describe('change user password with token', () => {
    it('changes user password', async () => {
      const user = await userTestUtils.createAndPersist();

      const resetPasswordToken = tokenService.createToken({
        data: {
          userId: user.id,
          type: TokenType.passwordReset,
        },
        expiresIn: Generator.number(10000, 100000),
      });

      const newPassword = Generator.password();

      await commandHandler.execute({
        newPassword,
        identifier: {
          resetPasswordToken,
        },
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
          type: TokenType.passwordReset,
        },
        expiresIn: Generator.number(10000, 100000),
      });

      try {
        await commandHandler.execute({
          newPassword,
          identifier: {
            resetPasswordToken,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(OperationNotValidError);

        expect((error as OperationNotValidError).context).toMatchObject({
          reason: 'User not found.',
          userId,
        });

        return;
      }

      expect.fail();
    });

    it('throws an error - when password does not meet the requirements', async () => {
      const user = await userTestUtils.createAndPersist();

      const resetPasswordToken = tokenService.createToken({
        data: {
          userId: user.id,
          type: TokenType.passwordReset,
        },
        expiresIn: Generator.number(10000, 100000),
      });

      const newPassword = Generator.alphaString(5);

      try {
        await commandHandler.execute({
          newPassword,
          identifier: {
            resetPasswordToken,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(OperationNotValidError);

        return;
      }

      expect.fail();
    });

    it('throws an error - when resetPasswordToken is invalid', async () => {
      const invalidResetPasswordToken = 'invalidResetPasswordToken';

      const newPassword = Generator.password();

      try {
        await commandHandler.execute({
          newPassword,
          identifier: {
            resetPasswordToken: invalidResetPasswordToken,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(OperationNotValidError);

        expect((error as OperationNotValidError).context).toMatchObject({
          reason: 'Invalid reset password token.',
          token: invalidResetPasswordToken,
        });

        return;
      }

      expect.fail();
    });

    it('throws an error - when token is has a different purpose', async () => {
      const user = await userTestUtils.createAndPersist();

      const resetPasswordToken = tokenService.createToken({
        data: {
          userId: user.id,
          type: TokenType.refreshToken,
        },
        expiresIn: Generator.number(10000, 100000),
      });

      const newPassword = Generator.password();

      try {
        await commandHandler.execute({
          newPassword,
          identifier: {
            resetPasswordToken,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(OperationNotValidError);

        expect((error as OperationNotValidError).context).toMatchObject({
          reason: 'Invalid reset password token.',
          resetPasswordToken,
        });

        return;
      }

      expect.fail();
    });
  });

  describe('change user password with userId', () => {
    it('changes user password', async () => {
      const user = await userTestUtils.createAndPersist();

      const newPassword = Generator.password();

      await commandHandler.execute({
        newPassword,
        identifier: {
          userId: user.id,
        },
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

      try {
        await commandHandler.execute({
          newPassword,
          identifier: {
            userId,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(OperationNotValidError);

        expect((error as OperationNotValidError).context).toMatchObject({
          reason: 'User not found.',
          userId,
        });

        return;
      }

      expect.fail();
    });

    it('throws an error - when password does not meet the requirements', async () => {
      const user = await userTestUtils.createAndPersist();

      const newPassword = Generator.alphaString(5);

      try {
        await commandHandler.execute({
          newPassword,
          identifier: {
            userId: user.id,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(OperationNotValidError);

        return;
      }

      expect.fail();
    });
  });
});
