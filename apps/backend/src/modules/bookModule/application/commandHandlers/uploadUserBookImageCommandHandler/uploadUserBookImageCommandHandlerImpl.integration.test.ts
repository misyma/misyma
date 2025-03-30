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
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type S3TestUtils } from '../../../../../libs/s3/tests/utils/s3TestUtils.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type TestDataOrchestrator } from '../../../tests/utils/testDataOrchestrator/testDataOrchestrator.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

import { type UploadUserBookImageCommandHandler } from './uploadUserBookImageCommandHandler.js';

describe('UploadUserBookImageCommandHandlerImpl', () => {
  let commandHandler: UploadUserBookImageCommandHandler;

  let s3TestUtils: S3TestUtils;

  let container: DependencyInjectionContainer;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let databaseClient: DatabaseClient;

  let config: Config;

  let testDataOrchestrator: TestDataOrchestrator;

  let testUtils: TestUtils[];

  const testUserId = Generator.uuid();

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

    commandHandler = container.get<UploadUserBookImageCommandHandler>(symbols.uploadUserBookImageCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    s3TestUtils = container.get<S3TestUtils>(testSymbols.s3TestUtils);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    config = container.get<Config>(coreSymbols.config);

    testDataOrchestrator = container.get<TestDataOrchestrator>(testSymbols.testDataOrchestrator);

    testUtils = [userTestUtils, userBookTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await testDataOrchestrator.cleanup();

    await s3TestUtils.createBucket(bucketName);

    await userTestUtils.createAndPersist({
      input: {
        id: testUserId,
      },
    });

    testDataOrchestrator.setUserId(testUserId);
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();

    await s3TestUtils.deleteBucket(bucketName);
  });

  it('throws an error - when UserBook does not exist', async () => {
    const userBookId = Generator.uuid();

    try {
      await commandHandler.execute({
        userId: testUserId,
        userBookId,
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
    const userBook = await testDataOrchestrator.createUserBook();

    const existsBefore = await s3TestUtils.objectExists(bucketName, sampleFileName);

    expect(existsBefore).toBe(false);

    const { userBook: updatedUserBook } = await commandHandler.execute({
      userId: testUserId,
      userBookId: userBook.id,
      data: createReadStream(filePath),
      contentType: 'image/jpg',
    });

    expect(updatedUserBook.imageUrl).toEqual(`${config.aws.cloudfrontUrl}/${imageId}`);

    const foundUserBook = await userBookTestUtils.findById({ id: userBook.id });

    expect(foundUserBook?.imageUrl).toEqual(`${config.aws.cloudfrontUrl}/${imageId}`);

    const existsAfter = await s3TestUtils.objectExists(bucketName, imageId);

    expect(existsAfter).toBe(true);
  });

  it('uploads an image when UserBook already has some image', async () => {
    const existingImageId = Generator.uuid();

    await s3TestUtils.uploadObject(bucketName, existingImageId, filePath);

    const userBook = await testDataOrchestrator.createUserBook({
      userBook: {
        input: {
          imageUrl: `${config.aws.cloudfrontUrl}/${existingImageId}`,
        },
      },
    });

    const oldImageExistsBefore = await s3TestUtils.objectExists(bucketName, existingImageId);

    expect(oldImageExistsBefore).toBe(true);

    const newImageExistsBefore = await s3TestUtils.objectExists(bucketName, imageId);

    expect(newImageExistsBefore).toBe(false);

    const { userBook: updatedUserBook } = await commandHandler.execute({
      userId: testUserId,
      userBookId: userBook.id,
      data: createReadStream(filePath),
      contentType: 'image/jpg',
    });

    expect(updatedUserBook.imageUrl).toEqual(`${config.aws.cloudfrontUrl}/${imageId}`);

    const foundUserBook = await userBookTestUtils.findById({ id: userBook.id });

    expect(foundUserBook?.imageUrl).toEqual(`${config.aws.cloudfrontUrl}/${imageId}`);

    const newImageExistsAfter = await s3TestUtils.objectExists(bucketName, imageId);

    expect(newImageExistsAfter).toBe(true);

    const oldImageExistsAfter = await s3TestUtils.objectExists(bucketName, existingImageId);

    expect(oldImageExistsAfter).toBe(false);
  });

  it('throws an error - when User does not own the book', async () => {
    const user2 = await userTestUtils.createAndPersist();

    const userBook = await testDataOrchestrator.createUserBook();

    try {
      await commandHandler.execute({
        userId: user2.id,
        userBookId: userBook.id,
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
