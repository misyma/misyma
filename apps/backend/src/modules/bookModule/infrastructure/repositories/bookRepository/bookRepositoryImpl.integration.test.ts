import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { BookFormat } from '@common/contracts';
import { Generator } from '@common/tests';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { Author } from '../../../../authorModule/domain/entities/author/author.js';
import { type AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { Book } from '../../../domain/entities/book/book.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('BookRepositoryImpl', () => {
  let bookRepository: BookRepository;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let genreTestUtils: GenreTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    bookRepository = container.get<BookRepository>(symbols.bookRepository);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await genreTestUtils.truncate();

    await databaseClient.destroy();
  });

  describe('saveBook', () => {
    it('creates a book', async () => {
      const author = await authorTestUtils.createAndPersist();

      const createdBook = bookTestFactory.create({
        authors: [new Author(author)],
      });

      const book = await bookRepository.saveBook({
        book: {
          title: createdBook.getTitle(),
          isbn: createdBook.getIsbn(),
          publisher: createdBook.getPublisher(),
          releaseYear: createdBook.getReleaseYear(),
          language: createdBook.getLanguage(),
          translator: createdBook.getTranslator(),
          format: createdBook.getFormat(),
          pages: createdBook.getPages(),
          isApproved: createdBook.getIsApproved(),
          imageUrl: createdBook.getImageUrl(),
          authors: [new Author(author)],
        },
      });

      const foundBook = await bookTestUtils.findByTitleAndAuthor({
        title: createdBook.getTitle(),
        authorId: author.id,
      });

      expect(book.getState()).toEqual({
        title: createdBook.getTitle(),
        isbn: createdBook.getIsbn(),
        publisher: createdBook.getPublisher(),
        releaseYear: createdBook.getReleaseYear(),
        language: createdBook.getLanguage(),
        translator: createdBook.getTranslator(),
        format: createdBook.getFormat(),
        pages: createdBook.getPages(),
        isApproved: createdBook.getIsApproved(),
        imageUrl: createdBook.getImageUrl(),
        authors: [
          {
            id: author.id,
            state: {
              name: author.name,
              isApproved: author.isApproved,
            },
          },
        ],
      });

      expect(foundBook).toEqual({
        id: book.getId(),
        title: createdBook.getTitle(),
        isbn: createdBook.getIsbn(),
        publisher: createdBook.getPublisher(),
        releaseYear: createdBook.getReleaseYear(),
        language: createdBook.getLanguage(),
        translator: createdBook.getTranslator(),
        format: createdBook.getFormat(),
        pages: createdBook.getPages(),
        isApproved: createdBook.getIsApproved(),
        imageUrl: createdBook.getImageUrl(),
      });
    });

    it('removes book Authors', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id, author3.id],
        },
      });

      const book = bookTestFactory.create({
        ...bookRawEntity,
        authors: [new Author(author1), new Author(author2), new Author(author3)],
      });

      book.deleteAuthor(new Author(author1));

      book.deleteAuthor(new Author(author2));

      const updatedBook = await bookRepository.saveBook({
        book,
      });

      const foundBook = await bookRepository.findBook({
        id: book.getId(),
      });

      expect(updatedBook.getAuthors()).toHaveLength(1);

      expect(foundBook?.getAuthors()).toHaveLength(1);

      expect(updatedBook.getAuthors()[0]?.getId()).toEqual(author3.id);

      expect(foundBook?.getAuthors()[0]?.getId()).toEqual(author3.id);

      const updatedBookAuthors = await bookTestUtils.findBookAuthors({
        bookId: book.getId(),
      });

      expect(updatedBookAuthors.length).toEqual(1);
    });

    it('adds book Authors', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const author4 = await authorTestUtils.createAndPersist();

      const author5 = await authorTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id, author3.id],
        },
      });

      const book = bookTestFactory.create({
        ...bookRawEntity,
        authors: [new Author(author1), new Author(author2), new Author(author3)],
      });

      book.addAuthor(new Author(author4));

      book.addAuthor(new Author(author5));

      const updatedBook = await bookRepository.saveBook({
        book,
      });

      const foundBook = await bookRepository.findBook({
        id: book.getId(),
      });

      [author1.id, author2.id, author3.id, author4.id, author5.id].every((authorId) => {
        expect(updatedBook.getAuthors().some((author) => author.getId() === authorId)).toBeTruthy();

        expect(foundBook?.getAuthors().some((author) => author.getId() === authorId)).toBeTruthy();
      });

      const updatedBookAuthors = await bookTestUtils.findBookAuthors({
        bookId: book.getId(),
      });

      expect(updatedBookAuthors).toHaveLength(5);
    });

    it('updates Book data', async () => {
      const author = await authorTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const book = bookTestFactory.create(bookRawEntity);

      const newTitle = Generator.alphaString(20);

      const newIsbn = Generator.isbn();

      const newPublisher = Generator.word();

      const newReleaseYear = (bookRawEntity.releaseYear as number) + 1;

      const newLanguage = 'english';

      const newTranslator = Generator.fullName();

      const newFormat = BookFormat.ebook;

      const newPages = (bookRawEntity.pages as number) + 10;

      const newIsApproved = !bookRawEntity.isApproved;

      const newImageUrl = Generator.imageUrl();

      book.setTitle({ title: newTitle });

      book.setIsbn({ isbn: newIsbn });

      book.setPublisher({ publisher: newPublisher });

      book.setReleaseYear({ releaseYear: newReleaseYear });

      book.setLanguage({ language: newLanguage });

      book.setTranslator({ translator: newTranslator });

      book.setFormat({ format: newFormat });

      book.setPages({ pages: newPages });

      book.setIsApproved({ isApproved: newIsApproved });

      book.setImageUrl({ imageUrl: newImageUrl });

      const updatedBook = await bookRepository.saveBook({
        book,
      });

      const foundBook = await bookTestUtils.findById({
        id: book.getId(),
      });

      expect(updatedBook.getState()).toEqual({
        title: newTitle,
        isbn: newIsbn,
        publisher: newPublisher,
        releaseYear: newReleaseYear,
        language: newLanguage,
        translator: newTranslator,
        format: newFormat,
        pages: newPages,
        isApproved: newIsApproved,
        imageUrl: newImageUrl,
        authors: [],
      });

      expect(foundBook).toEqual({
        id: book.getId(),
        title: newTitle,
        isbn: newIsbn,
        publisher: newPublisher,
        releaseYear: newReleaseYear,
        language: newLanguage,
        translator: newTranslator,
        format: newFormat,
        pages: newPages,
        isApproved: newIsApproved,
        imageUrl: newImageUrl,
      });
    });
  });

  describe('findBook', () => {
    it('finds book by id', async () => {
      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const foundBook = await bookRepository.findBook({ id: book.id });

      expect(foundBook).toBeInstanceOf(Book);

      expect(foundBook?.getAuthors()).toHaveLength(1);
    });

    it('finds a Book without Authors', async () => {
      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [],
        },
      });

      const foundBook = await bookRepository.findBook({ id: book.id });

      expect(foundBook).toBeInstanceOf(Book);

      expect(foundBook?.getAuthors()).toHaveLength(0);
    });

    it('returns null if book with given id does not exist', async () => {
      const id = Generator.uuid();

      const book = await bookRepository.findBook({ id });

      expect(book).toBeNull();
    });
  });

  describe('findBooks', () => {
    it('finds books', async () => {
      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const foundBooks = await bookRepository.findBooks({});

      expect(foundBooks.length).toEqual(2);

      [book1.id, book2.id].every((bookId) => {
        expect(foundBooks.some((book) => book.getId() === bookId)).toBeTruthy();
      });
    });

    it('finds approved books', async () => {
      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: { isApproved: true },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: { isApproved: false },
        },
      });

      const foundBooks = await bookRepository.findBooks({ isApproved: true });

      expect(foundBooks.length).toEqual(1);

      expect(foundBooks[0]?.getId()).toEqual(book1.id);
    });

    it('finds book by isbn', async () => {
      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const foundBooks = await bookRepository.findBooks({ isbn: book.isbn as string });

      expect(foundBooks.length).toEqual(1);

      expect(foundBooks[0]?.getIsbn()).toEqual(book.isbn);
    });
  });

  describe('delete', () => {
    it('deletes book', async () => {
      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      await bookRepository.deleteBook({ id: book.id });

      const foundBook = await bookTestUtils.findById({ id: book.id });

      expect(foundBook).toBeUndefined();
    });

    it('throws an error if book with given id does not exist', async () => {
      const id = Generator.uuid();

      await expect(async () => await bookRepository.deleteBook({ id })).toThrowErrorInstance({
        instance: ResourceNotFoundError,
        context: {
          resource: 'Book',
          id,
        },
      });
    });
  });
});
