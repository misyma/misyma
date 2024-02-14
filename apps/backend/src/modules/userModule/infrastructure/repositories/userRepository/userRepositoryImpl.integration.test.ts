import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '@common/tests';

import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('UserRepositoryImpl', () => {
  let userRepository: UserRepository;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    userRepository = container.get<UserRepository>(symbols.userRepository);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = new UserTestUtils(sqliteDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  describe('Create', () => {
    it('creates a User', async () => {
      const createdUser = userTestFactory.create();

      const { email, name, password, isEmailVerified } = createdUser.getState();

      const user = await userRepository.createUser({
        email,
        password,
        name,
        isEmailVerified,
      });

      const foundUser = await userTestUtils.findByEmail({ email });

      expect(user.getEmail()).toEqual(email);

      expect(foundUser?.email).toEqual(email);
    });

    it('throws an error when a User with the same email already exists', async () => {
      const existingUser = await userTestUtils.createAndPersist();

      try {
        await userRepository.createUser({
          email: existingUser.email,
          password: existingUser.password,
          name: existingUser.name,
          isEmailVerified: existingUser.isEmailVerified,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        return;
      }

      expect.fail();
    });
  });

  describe('Find', () => {
    it('finds a User by id', async () => {
      const user = await userTestUtils.createAndPersist();

      const foundUser = await userRepository.findUser({ id: user.id });

      expect(foundUser).not.toBeNull();
    });

    it('finds a User by email', async () => {
      const user = await userTestUtils.createAndPersist();

      const foundUser = await userRepository.findUser({ email: user.email });

      expect(foundUser).not.toBeNull();
    });

    it('returns null if a User with given id does not exist', async () => {
      const createdUser = userTestFactory.create();

      const user = await userRepository.findUser({ id: createdUser.getId() });

      expect(user).toBeNull();
    });
  });

  describe('Update', () => {
    it(`updates User's password`, async () => {
      const user = await userTestUtils.createAndPersist();

      const createdUser = userTestFactory.create();

      createdUser.addUpdatePasswordAction({
        newPassword: createdUser.getPassword(),
      });

      const foundUser = await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      expect(foundUser.getPassword()).toEqual(createdUser.getPassword());
    });

    it(`updates User's name`, async () => {
      const user = await userTestUtils.createAndPersist();

      const createdUser = userTestFactory.create();

      createdUser.addUpdateNameAction({
        newName: createdUser.getName(),
      });

      const foundUser = await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      expect(foundUser.getName()).toEqual(createdUser.getName());
    });

    it(`creates User's refresh tokens`, async () => {
      const user = await userTestUtils.createAndPersist();

      const createdUser = userTestFactory.create();

      const refreshToken1 = Generator.alphaString(32);

      const expiresAt1 = Generator.futureDate();

      const refreshToken2 = Generator.alphaString(32);

      const expiresAt2 = Generator.futureDate();

      createdUser.addCreateRefreshTokenAction({
        token: refreshToken1,
        expiresAt: expiresAt1,
      });

      createdUser.addCreateRefreshTokenAction({
        token: refreshToken2,
        expiresAt: expiresAt2,
      });

      await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      const updatedUserTokens = await userTestUtils.findTokensByUserId({ userId: user.id });

      expect(updatedUserTokens.refreshTokens.includes(refreshToken1)).toBe(true);

      expect(updatedUserTokens.refreshTokens.includes(refreshToken2)).toBe(true);
    });

    it(`updates User's email verification token`, async () => {
      const user = await userTestUtils.createAndPersist();

      const createdUser = userTestFactory.create();

      await userTestUtils.createAndPersistEmailVerificationToken({
        input: {
          userId: user.id,
        },
      });

      const updatedEmailVerificationToken = Generator.alphaString(32);

      const expiresAt = Generator.futureDate();

      createdUser.addUpdateEmailVerificationTokenAction({
        token: updatedEmailVerificationToken,
        expiresAt,
      });

      await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      const updatedUserTokens = await userTestUtils.findTokensByUserId({ userId: user.id });

      expect(updatedUserTokens.emailVerificationToken).toEqual(updatedEmailVerificationToken);
    });

    it(`updates User's reset password token`, async () => {
      const user = await userTestUtils.createAndPersist();

      const createdUser = userTestFactory.create();

      await userTestUtils.createAndPersistResetPasswordToken({
        input: {
          userId: user.id,
        },
      });

      const updatedResetPasswordToken = Generator.alphaString(32);

      const expiresAt = Generator.futureDate();

      createdUser.addUpdateResetPasswordTokenAction({
        token: updatedResetPasswordToken,
        expiresAt,
      });

      await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      const updatedUserTokens = await userTestUtils.findTokensByUserId({ userId: user.id });

      expect(updatedUserTokens.resetPasswordToken).toEqual(updatedResetPasswordToken);
    });

    it(`updates User's email verification status`, async () => {
      const user = await userTestUtils.createAndPersist({ input: { isEmailVerified: false } });

      const createdUser = userTestFactory.create(user);

      createdUser.addVerifyEmailAction();

      const foundUser = await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      expect(foundUser.getIsEmailVerified()).toBeTruthy();
    });

    it('throws an error if a User with given id does not exist', async () => {
      const nonExistentUser = userTestFactory.create();

      nonExistentUser.addUpdatePasswordAction({
        newPassword: nonExistentUser.getPassword(),
      });

      try {
        await userRepository.updateUser({
          id: nonExistentUser.getId(),
          domainActions: nonExistentUser.getDomainActions(),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ResourceNotFoundError);

        return;
      }

      expect.fail();
    });
  });

  describe('Delete', () => {
    it('deletes a User', async () => {
      const user = await userTestUtils.createAndPersist();

      await userRepository.deleteUser({ id: user.id });

      const foundUser = await userTestUtils.findById({ id: user.id });

      expect(foundUser).toBeUndefined();
    });

    it('throws an error if a User with given id does not exist', async () => {
      const nonExistentUser = userTestFactory.create();

      try {
        await userRepository.deleteUser({ id: nonExistentUser.getId() });
      } catch (error) {
        expect(error).toBeInstanceOf(ResourceNotFoundError);

        return;
      }

      expect.fail();
    });
  });
});
