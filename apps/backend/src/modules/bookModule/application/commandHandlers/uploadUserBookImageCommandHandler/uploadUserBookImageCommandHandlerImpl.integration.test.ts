import { createReadStream } from 'node:fs';
import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { type UploadUserBookImageCommandHandler } from './uploadUserBookImageCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type Config } from '../../../../../core/config.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type S3TestUtils } from '../../../../../libs/s3/tests/utils/s3TestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('UploadUserBookImageCommandHandlerImpl', () => {
  let commandHandler: UploadUserBookImageCommandHandler;

  let s3TestUtils: S3TestUtils;

  let container: DependencyInjectionContainer;

  let userTestUtils: UserTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let databaseClient: DatabaseClient;

  let config: Config;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../../resources');

  const sampleFileName = 'book1.jpg';

  const bucketName = 'misyma-images';

  const filePath = path.join(resourcesDirectory, sampleFileName);

  beforeEach(async () => {
    container = TestContainer.create();

    commandHandler = container.get<UploadUserBookImageCommandHandler>(symbols.uploadUserBookImageCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    s3TestUtils = container.get<S3TestUtils>(testSymbols.s3TestUtils);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    config = container.get<Config>(coreSymbols.config);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userBookTestUtils.truncate();

    await userTestUtils.truncate();

    await s3TestUtils.createBucket(bucketName);
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await userBookTestUtils.truncate();

    await databaseClient.destroy();

    await s3TestUtils.deleteBucket(bucketName);
  });

  it('throws an error - when UserBook does not exist', async () => {
    const userBookId = Generator.uuid();

    try {
      await commandHandler.execute({
        userBookId,
        contentType: 'image/jpg',
        data: createReadStream(filePath),
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('uploads an image', async () => {
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
      },
    });

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const existsBefore = await s3TestUtils.objectExists(bucketName, sampleFileName);

    expect(existsBefore).toBe(false);

    const { userBook: updatedUserBook } = await commandHandler.execute({
      userBookId: userBook.id,
      data: createReadStream(filePath),
      contentType: 'image/jpg',
    });

    expect(updatedUserBook.getImageUrl()).toEqual(`${config.aws.cloudfrontUrl}/${userBook.id}`);

    const foundUserBook = await userBookTestUtils.findById({ id: userBook.id });

    expect(foundUserBook.imageUrl).toEqual(`${config.aws.cloudfrontUrl}/${userBook.id}`);

    const existsAfter = await s3TestUtils.objectExists(bucketName, userBook.id);

    expect(existsAfter).toBe(true);
  });
});
