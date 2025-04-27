import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestRepository } from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';
import { symbols } from '../../../symbols.js';
import { BookChangeRequestTestFactory } from '../../../tests/factories/bookChangeRequestTestFactory/bookChangeRequestTestFactory.js';
import { type BookChangeRequestTestUtils } from '../../../tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type TestDataOrchestrator } from '../../../tests/utils/testDataOrchestrator/testDataOrchestrator.js';

describe('BookChangeRequestRepositoryImpl', () => {
  let bookChangeRequestRepository: BookChangeRequestRepository;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let bookChangeRequestTestUtils: BookChangeRequestTestUtils;

  let userTestUtils: UserTestUtils;

  const bookChangeRequestTestFactory = new BookChangeRequestTestFactory();

  const testUserId = Generator.uuid();

  let testDataOrchestrator: TestDataOrchestrator;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    bookChangeRequestRepository = container.get<BookChangeRequestRepository>(symbols.bookChangeRequestRepository);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookChangeRequestTestUtils = container.get<BookChangeRequestTestUtils>(testSymbols.bookChangeRequestTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testDataOrchestrator = container.get<TestDataOrchestrator>(testSymbols.testDataOrchestrator);

    testUtils = [bookTestUtils, userTestUtils, bookChangeRequestTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await testDataOrchestrator.cleanup();

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
  });

  describe('saveBookChangeRequest', () => {
    it('creates a book change request', async () => {
      const { email } = await userTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook();

      const createdBookChangeRequest = bookChangeRequestTestFactory.create({
        bookId: book.id,
        userEmail: email,
      });

      const authorId = Generator.uuid();

      const bookChangeRequest = await bookChangeRequestRepository.saveBookChangeRequest({
        bookChangeRequest: {
          title: createdBookChangeRequest.getTitle(),
          isbn: createdBookChangeRequest.getIsbn(),
          publisher: createdBookChangeRequest.getPublisher(),
          releaseYear: createdBookChangeRequest.getReleaseYear(),
          language: createdBookChangeRequest.getLanguage(),
          translator: createdBookChangeRequest.getTranslator(),
          format: createdBookChangeRequest.getFormat(),
          pages: createdBookChangeRequest.getPages(),
          imageUrl: createdBookChangeRequest.getImageUrl(),
          bookId: createdBookChangeRequest.getBookId(),
          userEmail: createdBookChangeRequest.getUserEmail(),
          createdAt: createdBookChangeRequest.getCreatedAt(),
          authorIds: [authorId],
          changedFields: ['title', 'translator'],
        },
      });

      const foundBookChangeRequest = await bookChangeRequestTestUtils.findById({ id: bookChangeRequest.getId() });

      expect(bookChangeRequest.getState()).toEqual({
        title: createdBookChangeRequest.getTitle(),
        isbn: createdBookChangeRequest.getIsbn(),
        publisher: createdBookChangeRequest.getPublisher(),
        releaseYear: createdBookChangeRequest.getReleaseYear(),
        language: createdBookChangeRequest.getLanguage(),
        translator: createdBookChangeRequest.getTranslator(),
        format: createdBookChangeRequest.getFormat(),
        pages: createdBookChangeRequest.getPages(),
        imageUrl: createdBookChangeRequest.getImageUrl(),
        bookId: createdBookChangeRequest.getBookId(),
        userEmail: createdBookChangeRequest.getUserEmail(),
        createdAt: createdBookChangeRequest.getCreatedAt(),
        authorIds: [authorId],
        bookTitle: book.title,
        changedFields: ['title', 'translator'],
      });

      expect(foundBookChangeRequest).toEqual({
        id: bookChangeRequest.getId(),
        title: createdBookChangeRequest.getTitle(),
        isbn: createdBookChangeRequest.getIsbn(),
        publisher: createdBookChangeRequest.getPublisher(),
        releaseYear: createdBookChangeRequest.getReleaseYear(),
        language: createdBookChangeRequest.getLanguage(),
        translator: createdBookChangeRequest.getTranslator(),
        format: createdBookChangeRequest.getFormat(),
        pages: createdBookChangeRequest.getPages(),
        imageUrl: createdBookChangeRequest.getImageUrl(),
        bookId: createdBookChangeRequest.getBookId(),
        userEmail: createdBookChangeRequest.getUserEmail(),
        createdAt: createdBookChangeRequest.getCreatedAt(),
        authorIds: authorId,
        changedFields: 'title,translator',
      });
    });
  });

  describe('findBookChangeRequest', () => {
    it('finds a book change request by id', async () => {
      const { email } = await userTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook();

      const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          userEmail: email,
        },
      });

      const foundBookChangeRequest = await bookChangeRequestRepository.findBookChangeRequest({
        id: bookChangeRequest.id,
      });

      expect(foundBookChangeRequest).toBeInstanceOf(BookChangeRequest);

      expect(foundBookChangeRequest?.getId()).toEqual(bookChangeRequest.id);

      expect(foundBookChangeRequest?.getState()).toEqual({
        title: foundBookChangeRequest?.getTitle(),
        isbn: foundBookChangeRequest?.getIsbn(),
        publisher: foundBookChangeRequest?.getPublisher(),
        releaseYear: foundBookChangeRequest?.getReleaseYear(),
        language: foundBookChangeRequest?.getLanguage(),
        translator: foundBookChangeRequest?.getTranslator(),
        format: foundBookChangeRequest?.getFormat(),
        pages: foundBookChangeRequest?.getPages(),
        imageUrl: foundBookChangeRequest?.getImageUrl(),
        bookId: foundBookChangeRequest?.getBookId(),
        userEmail: foundBookChangeRequest?.getUserEmail(),
        createdAt: foundBookChangeRequest?.getCreatedAt(),
        bookTitle: book.title,
        changedFields: foundBookChangeRequest?.getChangedFields(),
      });
    });

    it('returns null if book with given id does not exist', async () => {
      const id = Generator.uuid();

      const bookChangeRequest = await bookChangeRequestRepository.findBookChangeRequest({ id });

      expect(bookChangeRequest).toBeNull();
    });
  });

  describe('findBookChangeRequests', () => {
    it('finds books change requests', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook();

      const bookChangeRequest1 = await bookChangeRequestTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          userEmail: user1.email,
        },
      });

      const bookChangeRequest2 = await bookChangeRequestTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          userEmail: user2.email,
        },
      });

      const foundBookChangeRequests = await bookChangeRequestRepository.findBookChangeRequests({
        page: 1,
        pageSize: 10,
      });

      expect(foundBookChangeRequests.length).toEqual(2);

      const allRequestsFound = [bookChangeRequest1.id, bookChangeRequest2.id].every((bookChangeRequestId) =>
        foundBookChangeRequests.some(
          (foundBookChangeRequest) => foundBookChangeRequest.getId() === bookChangeRequestId,
        ),
      );

      expect(allRequestsFound).toBeTruthy();
    });

    it('returns empty array if there are no book change requests', async () => {
      const foundBookChangeRequests = await bookChangeRequestRepository.findBookChangeRequests({
        page: 1,
        pageSize: 10,
      });

      expect(foundBookChangeRequests.length).toEqual(0);
    });

    it('finds books change requests by user id', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook();

      const bookChangeRequest1 = await bookChangeRequestTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          userEmail: user1.email,
        },
      });

      await bookChangeRequestTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          userEmail: user2.email,
        },
      });

      const foundBookChangeRequests = await bookChangeRequestRepository.findBookChangeRequests({
        userEmail: user1.email,
        page: 1,
        pageSize: 10,
      });

      expect(foundBookChangeRequests.length).toEqual(1);

      expect(foundBookChangeRequests[0]?.getId()).toEqual(bookChangeRequest1.id);
    });

    it('finds book change request by id', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook();

      const bookChangeRequest1 = await bookChangeRequestTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          userEmail: user1.email,
        },
      });

      const foundBookChangeRequests = await bookChangeRequestRepository.findBookChangeRequests({
        userEmail: user1.email,
        page: 1,
        pageSize: 10,
      });

      expect(foundBookChangeRequests.length).toEqual(1);

      expect(foundBookChangeRequests[0]?.getId()).toEqual(bookChangeRequest1.id);
    });
  });

  describe('delete', () => {
    it('deletes a book change request', async () => {
      const user = await userTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook();

      const bookChangeRequest = await bookChangeRequestTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          userEmail: user.email,
        },
      });

      await bookChangeRequestRepository.deleteBookChangeRequest({ id: bookChangeRequest.id });

      const foundBookChangeRequest = await bookChangeRequestTestUtils.findById({ id: book.id });

      expect(foundBookChangeRequest).toBeNull();
    });
  });
});
