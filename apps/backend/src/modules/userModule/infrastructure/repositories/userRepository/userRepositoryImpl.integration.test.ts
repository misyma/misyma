import { beforeEach, afterEach, expect, describe, it } from 'vitest';

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

      const { email, firstName, lastName, password } = createdUser.getState();

      const user = await userRepository.createUser({
        email,
        password,
        firstName,
        lastName,
      });

      const foundUser = await userTestUtils.findByEmail({ email });

      expect(user.getEmail()).toEqual(email);

      expect(foundUser.email).toEqual(email);
    });

    it('throws an error when a User with the same email already exists', async () => {
      const existingUser = await userTestUtils.createAndPersist();

      try {
        await userRepository.createUser({
          email: existingUser.email,
          password: existingUser.password,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
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

    it(`updates User's first name`, async () => {
      const user = await userTestUtils.createAndPersist();

      const createdUser = userTestFactory.create();

      createdUser.addUpdateFirstNameAction({
        newFirstName: createdUser.getFirstName(),
      });

      const foundUser = await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      expect(foundUser.getFirstName()).toEqual(createdUser.getFirstName());
    });

    it(`updates User's last name`, async () => {
      const user = await userTestUtils.createAndPersist();

      const createdUser = userTestFactory.create();

      createdUser.addUpdateLastNameAction({
        newLastName: createdUser.getLastName(),
      });

      const foundUser = await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      expect(foundUser.getLastName()).toEqual(createdUser.getLastName());
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
