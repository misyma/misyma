import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type DeleteBookReadingCommandHandler } from './deleteBookReadingCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';

describe('DeleteBookReadingCommandHandlerImpl', () => {
  let commandHandler: DeleteBookReadingCommandHandler;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<DeleteBookReadingCommandHandler>(symbols.updateBookReadingNameCommandHandler);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await bookReadingTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await bookReadingTestUtils.truncate();
  });

  it('throws an error - when BookReading was not found', async () => {
    const nonExistentBookReadingId = Generator.uuid();

    expect(
      async () =>
        await commandHandler.execute({
          id: nonExistentBookReadingId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'BookReading',
        id: nonExistentBookReadingId,
      },
    });
  });

  it('deletes a BookReading', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist({
      input: {
        book: {
          bookshelfId: bookshelf.id,
        },
      },
    });

    const bookReading = await bookReadingTestUtils.createAndPersist({
      input: {
        bookId: book.id,
      },
    });

    await commandHandler.execute({
      id: bookReading.id,
    });

    const foundBookReading = await bookReadingTestUtils.findById({
      id: bookReading.id,
    });

    expect(foundBookReading).toBeNull();
  });
});
