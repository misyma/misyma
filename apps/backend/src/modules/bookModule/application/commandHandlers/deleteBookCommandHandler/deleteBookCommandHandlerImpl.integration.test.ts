import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '@common/tests';

import { type DeleteBookCommandHandler } from './deleteBookCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('DeleteBookCommandHandler', () => {
  let deleteBookCommandHandler: DeleteBookCommandHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    deleteBookCommandHandler = container.get<DeleteBookCommandHandler>(symbols.deleteBookCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('deletes book', async () => {
    const author = await authorTestUtils.createAndPersist();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
      },
    });

    await deleteBookCommandHandler.execute({ bookId: book.id });

    const foundBook = await bookTestUtils.findById({ id: book.id });

    expect(foundBook).toBeUndefined();
  });

  it('throws an error if book with given id does not exist', async () => {
    const id = Generator.uuid();

    await expect(async () => deleteBookCommandHandler.execute({ bookId: id })).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Book',
      },
    });
  });
});
