import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type ApplyBookChangeRequestCommandHandler } from './applyBookChangeRequestCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookChangeRequestTestUtils } from '../../../tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('ApplyBookChangeRequestCommandHandlerImpl', () => {
  let commandHandler: ApplyBookChangeRequestCommandHandler;

  let bookTestUtils: BookTestUtils;

  let bookChangeRequestTestUtils: BookChangeRequestTestUtils;

  let userTestUtils: UserTestUtils;

  let databaseClient: DatabaseClient;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<ApplyBookChangeRequestCommandHandler>(symbols.applyBookChangeRequestCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookChangeRequestTestUtils = container.get<BookChangeRequestTestUtils>(testSymbols.bookChangeRequestTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testUtils = [bookTestUtils, userTestUtils, bookChangeRequestTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  it('throws an error - when BookChangeRequest does not exist', async () => {
    const nonExistentBookChangeRequestId = Generator.uuid();

    await expect(async () =>
      commandHandler.execute({
        bookChangeRequestId: nonExistentBookChangeRequestId,
      }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
    });
  });

  it('applies a BookChangeRequest to the Book', async () => {
    const user = await userTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist();

    const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        userId: user.id,
      },
    });

    await commandHandler.execute({ bookChangeRequestId: bookChangeRequest.id });

    const updatedBook = await bookTestUtils.findById({ id: book.id });

    expect(updatedBook).toEqual({
      id: book.id,
      title: bookChangeRequest.title,
      publisher: bookChangeRequest.publisher,
      releaseYear: bookChangeRequest.releaseYear,
      isbn: bookChangeRequest.isbn,
      language: bookChangeRequest.language,
      translator: bookChangeRequest.translator,
      format: bookChangeRequest.format,
      pages: bookChangeRequest.pages,
      imageUrl: bookChangeRequest.imageUrl,
      isApproved: book.isApproved,
    });
  });
});
