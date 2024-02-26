import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type UpdateBookGenresCommandHandler } from './updateBookGenresCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('UpdateBookGenresCommandHandlerImpl', () => {
  let commandHandler: UpdateBookGenresCommandHandler;

  let genreTestUtils: GenreTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let authorTestUtils: AuthorTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateBookGenresCommandHandler>(symbols.updateBookGenresCommandHandler);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await bookTestUtils.truncate();

    await genreTestUtils.destroyDatabaseConnection();
  });

  it('throws an error - when Book does not exist', async () => {
    const nonExistentBookId = Generator.uuid();

    await expect(async () =>
      commandHandler.execute({
        bookId: nonExistentBookId,
        genreIds: [],
      }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      message: 'Resource not found.',
      context: {
        name: 'Book',
        id: nonExistentBookId,
      },
    });
  });

  it('throws an error - when one of the Genres does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const author = await authorTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          bookshelfId: bookshelf.id,
        },
      },
    });

    const genre1 = await genreTestUtils.createAndPersist();

    const invalidGenreId = Generator.uuid();

    await expect(
      async () =>
        await commandHandler.execute({
          bookId: book.id,
          genreIds: [genre1.id, invalidGenreId],
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Genre',
        id: [genre1.id, invalidGenreId],
      },
    });
  });

  it('updates Book Genres', async () => {
    const user = await userTestUtils.createAndPersist();

    const author = await authorTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          bookshelfId: bookshelf.id,
        },
      },
    });

    const genre1 = await genreTestUtils.createAndPersist();

    const genre2 = await genreTestUtils.createAndPersist();

    const genre3 = await genreTestUtils.createAndPersist();

    const result = await commandHandler.execute({
      bookId: book.id,
      genreIds: [genre1.id, genre2.id, genre3.id],
    });

    result.book.getGenres().forEach((genre) => {
      expect(genre.getId()).oneOf([genre1.id, genre2.id, genre3.id]);
    });
  });
});
