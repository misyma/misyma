import { createReadStream } from 'node:fs';
import path from 'node:path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type Config } from '../../../../../core/config.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type S3TestUtils } from '../../../../../libs/s3/tests/s3TestUtils.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

import { type UploadBookshelfImageCommandHandler } from './uploadBookshelfImageCommandHandler.js';

describe('UploadBookshelfImageCommandHandlerImpl', () => {
  let commandHandler: UploadBookshelfImageCommandHandler;

  let s3TestUtils: S3TestUtils;

  let container: DependencyInjectionContainer;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let databaseClient: DatabaseClient;

  let config: Config;

  let testUtils: TestUtils[];

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../../resources');

  const sampleFileName = 'book1.jpg';

  const bucketName = 'misyma-images';

  const filePath = path.join(resourcesDirectory, sampleFileName);

  const imageId = Generator.uuid();

  beforeEach(async () => {
    container = await TestContainer.create();

    await container.overrideBinding<UuidService>(coreSymbols.uuidService, () => ({
      generateUuid: (): string => imageId,
    }));

    commandHandler = container.get<UploadBookshelfImageCommandHandler>(symbols.uploadBookshelfImageCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    s3TestUtils = container.get<S3TestUtils>(testSymbols.s3TestUtils);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    config = container.get<Config>(coreSymbols.config);

    testUtils = [bookshelfTestUtils, userTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await s3TestUtils.createBucket(bucketName);
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();

    await s3TestUtils.deleteBucket(bucketName);
  });

  it('throws an error - when Bookshelf does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelfId = Generator.uuid();

    try {
      await commandHandler.execute({
        userId: user.id,
        bookshelfId,
        contentType: 'image/jpg',
        data: createReadStream(filePath),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      return;
    }

    expect.fail();
  });

  it('uploads an image', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        user_id: user.id,
      },
    });

    const existsBefore = await s3TestUtils.objectExists(bucketName, sampleFileName);

    expect(existsBefore).toBe(false);

    const { bookshelf: updatedBookshelf } = await commandHandler.execute({
      userId: user.id,
      bookshelfId: bookshelf.id,
      data: createReadStream(filePath),
      contentType: 'image/jpg',
    });

    expect(updatedBookshelf.getImageUrl()).toEqual(`${config.aws.cloudfrontUrl}/${imageId}`);

    const foundBookshelf = await bookshelfTestUtils.findById({ id: bookshelf.id });

    expect(foundBookshelf?.image_url).toEqual(`${config.aws.cloudfrontUrl}/${imageId}`);

    const existsAfter = await s3TestUtils.objectExists(bucketName, imageId);

    expect(existsAfter).toBe(true);
  });

  it('uploads an image when Bookshelf already has some image', async () => {
    const user = await userTestUtils.createAndPersist();

    const existingImageId = Generator.uuid();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        user_id: user.id,
        image_url: `${config.aws.cloudfrontUrl}/${existingImageId}`,
      },
    });

    await s3TestUtils.uploadObject(bucketName, existingImageId, filePath);

    const oldImageExistsBefore = await s3TestUtils.objectExists(bucketName, existingImageId);

    expect(oldImageExistsBefore).toBe(true);

    const newImageExistsBefore = await s3TestUtils.objectExists(bucketName, imageId);

    expect(newImageExistsBefore).toBe(false);

    const { bookshelf: updatedBookshelf } = await commandHandler.execute({
      userId: user.id,
      bookshelfId: bookshelf.id,
      data: createReadStream(filePath),
      contentType: 'image/jpg',
    });

    expect(updatedBookshelf.getImageUrl()).toEqual(`${config.aws.cloudfrontUrl}/${imageId}`);

    const foundBookshelf = await bookshelfTestUtils.findById({ id: bookshelf.id });

    expect(foundBookshelf?.image_url).toEqual(`${config.aws.cloudfrontUrl}/${imageId}`);

    const newImageExistsAfter = await s3TestUtils.objectExists(bucketName, imageId);

    expect(newImageExistsAfter).toBe(true);

    const oldImageExistsAfter = await s3TestUtils.objectExists(bucketName, existingImageId);

    expect(oldImageExistsAfter).toBe(false);
  });

  it('throws an error - when User does not own the Bookshelf', async () => {
    const user1 = await userTestUtils.createAndPersist();

    const user2 = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        user_id: user1.id,
      },
    });

    try {
      await commandHandler.execute({
        userId: user2.id,
        bookshelfId: bookshelf.id,
        data: createReadStream(filePath),
        contentType: 'image/jpg',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      return;
    }

    expect.fail();
  });
});
