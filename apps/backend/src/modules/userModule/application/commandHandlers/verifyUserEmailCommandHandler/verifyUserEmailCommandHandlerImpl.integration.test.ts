import { beforeEach, describe, expect, it, afterEach } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { tokenTypes } from '../../../../../common/types/tokenType.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

import { type VerifyUserEmailCommandHandler } from './verifyUserEmailCommandHandler.js';

describe('VerifyUserEmailCommandHandlerImpl', () => {
  let commandHandler: VerifyUserEmailCommandHandler;

  let databaseClient: DatabaseClient;

  let tokenService: TokenService;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<VerifyUserEmailCommandHandler>(symbols.verifyUserEmailCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('verifies user email', async () => {
    const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: false } });

    const emailVerificationToken = tokenService.createToken({
      data: {
        userId: user.id,
        type: tokenTypes.emailVerification,
      },
      expiresIn: Generator.number(10000, 100000),
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
      data: {
        userId,
        type: tokenTypes.emailVerification,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    try {
      await commandHandler.execute({ emailVerificationToken });
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

  it('throws an error - when emailVerificationToken is invalid', async () => {
    const invalidEmailVerificationToken = 'invalidEmailVerificationToken';

    try {
      await commandHandler.execute({ emailVerificationToken: invalidEmailVerificationToken });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Invalid email verification token.',
        token: invalidEmailVerificationToken,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when token is not an emailVerification token', async () => {
    const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: false } });

    const invalidEmailVerificationToken = tokenService.createToken({
      data: {
        userId: user.id,
        type: tokenTypes.refreshToken,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    try {
      await commandHandler.execute({ emailVerificationToken: invalidEmailVerificationToken });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Token type is not email verification token.',
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when UserTokens were found but emailVerificationToken is expired', async () => {
    const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: false } });

    const emailVerificationToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: 0,
    });

    try {
      await commandHandler.execute({ emailVerificationToken });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Invalid email verification token.',
        token: emailVerificationToken,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when User is already verified', async () => {
    const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: true } });

    const emailVerificationToken = tokenService.createToken({
      data: {
        userId: user.id,
        type: tokenTypes.emailVerification,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    try {
      await commandHandler.execute({ emailVerificationToken });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User email already verified.',
        email: user.email,
      });

      return;
    }

    expect.fail();
  });
});
