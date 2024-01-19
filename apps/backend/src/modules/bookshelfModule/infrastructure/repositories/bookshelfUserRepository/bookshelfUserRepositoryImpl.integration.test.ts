import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { type BookshelfUserRepository } from '../../../domain/repositories/bookshelfUserRepository/bookshelfUserRepository.js';
import { symbols } from '../../../symbols.js';

describe('BookshelfUserRepositoryImpl', () => {
  let repository: BookshelfUserRepository;

  let userTestUtils: UserTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    repository = container.get<BookshelfUserRepository>(symbols.bookshelfUserRepository);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);
  });

  afterEach(async () => {
    await userTestUtils.truncate();
  });

  it('returns false - when User does not exist', async () => {
    const nonExistentUserId = Generator.uuid();

    const result = await repository.exists({
      id: nonExistentUserId,
    });

    expect(result).toEqual(false);
  });

  it('returns true - when User exists', async () => {
    const user = await userTestUtils.createAndPersist();

    const result = await repository.exists({
      id: user.id,
    });

    expect(result).toEqual(true);
  });
});
