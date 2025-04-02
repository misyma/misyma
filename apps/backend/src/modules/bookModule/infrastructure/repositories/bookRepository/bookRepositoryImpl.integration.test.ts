import { BookFormat, Language } from '@common/contracts';
import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { Author } from '../../../domain/entities/author/author.js';
import { Book } from '../../../domain/entities/book/book.js';
import { Genre } from '../../../domain/entities/genre/genre.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('BookRepositoryImpl', () => {
  let bookRepository: BookRepository;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let genreTestUtils: GenreTestUtils;

  const bookTestFactory = new BookTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    bookRepository = container.get<BookRepository>(symbols.bookRepository);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    testUtils = [authorTestUtils, bookTestUtils, genreTestUtils];

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

  describe('saveBook', () => {
    it('creates a book', async () => {
      const author = await authorTestUtils.createAndPersist();

      const createdBook = bookTestFactory.create({
        authors: [new Author(author)],
      });

      const genre = await genreTestUtils.createAndPersist();

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
          createdAt: createdBook.getCreatedAt(),
          authors: [new Author(author)],
          genreId: genre.id,
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
        createdAt: createdBook.getCreatedAt(),
        genreId: genre.id,
        genreName: '',
        authors: [
          {
            id: author.id,
            state: {
              name: author.name,
              isApproved: author.isApproved,
              createdAt: author.createdAt,
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
        createdAt: createdBook.getCreatedAt(),
      });
    });

    it('removes book Authors', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id, author3.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book = bookTestFactory.create({
        ...bookRawEntity,
        format: bookRawEntity.format as BookFormat,
        authors: [new Author(author1), new Author(author2), new Author(author3)],
        genreId: genre.id,
        genre: new Genre({
          id: genre.id,
          name: genre.name,
        }),
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

      const genre = await genreTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id, author3.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book = bookTestFactory.create({
        ...bookRawEntity,
        format: bookRawEntity.format as BookFormat,
        authors: [new Author(author1)],
      });

      book.addAuthor(new Author(author2));

      book.addAuthor(new Author(author3));

      const updatedBook = await bookRepository.saveBook({
        book,
      });

      const foundBook = await bookRepository.findBook({
        id: book.getId(),
      });

      const allAuthorsMatch = [author1.id, author2.id, author3.id].every((authorId) => {
        const updatedBookHasAuthor = updatedBook.getAuthors().some((author) => author.getId() === authorId);
        const foundBookHasAuthor = foundBook?.getAuthors().some((author) => author.getId() === authorId);
        expect(updatedBookHasAuthor).toBeTruthy();
        expect(foundBookHasAuthor).toBeTruthy();
        return updatedBookHasAuthor && foundBookHasAuthor;
      });

      expect(allAuthorsMatch).toBeTruthy();

      const updatedBookAuthors = await bookTestUtils.findBookAuthors({
        bookId: book.getId(),
      });

      expect(updatedBookAuthors).toHaveLength(3);
    });

    it('updates Book data', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book = bookTestFactory.create({
        ...bookRawEntity,
        format: bookRawEntity.format as BookFormat
      });

      const newTitle = Generator.alphaString(20);

      const newIsbn = Generator.isbn();

      const newPublisher = Generator.word();

      const newReleaseYear = bookRawEntity.releaseYear + 1;

      const newLanguage = Generator.language();

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
        genreId: genre.id,
        publisher: newPublisher,
        releaseYear: newReleaseYear,
        language: newLanguage,
        translator: newTranslator,
        format: newFormat,
        pages: newPages,
        isApproved: newIsApproved,
        genreName: book.getGenreName(),
        imageUrl: newImageUrl,
        createdAt: book.getCreatedAt(),
        authors: [],
      });

      expect(foundBook).toEqual({
        id: book.getId(),
        title: newTitle,
        genreId: genre.id,
        isbn: newIsbn,
        publisher: newPublisher,
        releaseYear: newReleaseYear,
        language: newLanguage,
        translator: newTranslator,
        format: newFormat,
        pages: newPages,
        isApproved: newIsApproved,
        imageUrl: newImageUrl,
        createdAt: book.getCreatedAt(),
      });
    });
  });

  describe('findBook', () => {
    it('finds book by id', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const foundBook = await bookRepository.findBook({ id: book.id });

      expect(foundBook).toBeInstanceOf(Book);

      expect(foundBook?.getAuthors()).toHaveLength(1);
    });

    it('finds a Book without Authors', async () => {
      const genre = await genreTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [],
          book: {
            genreId: genre.id,
          },
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

      const genre = await genreTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const foundBooks = await bookRepository.findBooks({
        page: 1,
        pageSize: 10,
      });

      expect(foundBooks.length).toEqual(2);

      const allBooksFound = [book1.id, book2.id].every((bookId) => foundBooks.some((book) => book.getId() === bookId));
      expect(allBooksFound).toBeTruthy();

      expect(foundBooks.every((book) => book.getAuthors()[0]?.getId() === author.id)).toBeTruthy();
    });

    it('finds approved books', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            isApproved: true,
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: { isApproved: false, genreId: genre.id },
        },
      });

      const foundBooks = await bookRepository.findBooks({
        isApproved: true,
        page: 1,
        pageSize: 10,
      });

      expect(foundBooks.length).toEqual(1);

      expect(foundBooks[0]?.getId()).toEqual(book1.id);

      expect(foundBooks[0]?.getAuthors()[0]).toEqual({
        id: author.id,
        state: {
          name: author.name,
          isApproved: author.isApproved,
          createdAt: author.createdAt,
        },
      });
    });

    it('finds book by isbn', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const foundBooks = await bookRepository.findBooks({
        isbn: book.isbn as string,
        page: 1,
        pageSize: 10,
      });

      expect(foundBooks.length).toEqual(1);

      expect(foundBooks[0]?.getIsbn()).toEqual(book.isbn);
    });

    it('finds no books when given partial title does not match any book title', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: 'The Lord of the Rings',
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: "Harry Potter and the Philosopher's Stone",
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: 'War and Peace',
            genreId: genre.id,
          },
        },
      });

      const partialTitle = 'game';

      const foundBooks = await bookRepository.findBooks({
        title: partialTitle,
        page: 1,
        pageSize: 10,
      });

      expect(foundBooks).toHaveLength(0);
    });

    it('finds books when given partial title that matches book title', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: 'The Lord of the Rings',
            genreId: genre.id,
          },
        },
      });

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: "Harry Potter and the Philosopher's Stone",
            genreId: genre.id,
          },
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: 'Harry Potter and the Chamber of Secrets',
            genreId: genre.id,
          },
        },
      });

      const foundBooks1 = await bookRepository.findBooks({
        title: 'Harry',
        page: 1,
        pageSize: 10,
      });

      const foundBooks2 = await bookRepository.findBooks({
        title: 'harry',
        page: 1,
        pageSize: 10,
      });

      const foundBooks3 = await bookRepository.findBooks({
        title: 'HAR',
        page: 1,
        pageSize: 10,
      });

      const foundBooks4 = await bookRepository.findBooks({
        title: 'potter',
        page: 1,
        pageSize: 10,
      });

      [foundBooks1, foundBooks2, foundBooks3, foundBooks4].forEach((foundBooks) => {
        expect(foundBooks).toHaveLength(2);
      });

      [foundBooks1, foundBooks2, foundBooks3, foundBooks4].forEach((foundBooks) => {
        foundBooks.forEach((foundBook) => {
          expect(foundBook.getId()).oneOf([book1.id, book2.id]);

          expect(foundBook.getTitle()).oneOf([book1.title, book2.title]);
        });
      });
    });

    it('finds books by author ids', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const foundBooks = await bookRepository.findBooks({
        authorIds: [author1.id, author2.id],
        page: 1,
        pageSize: 10,
      });

      expect(foundBooks.length).toEqual(2);

      const allBooksFound = [book1.id, book2.id].every((bookId) => foundBooks.some((book) => book.getId() === bookId));
      expect(allBooksFound).toBeTruthy();
    });

    it('finds books by language', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            language: Language.Polish,
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            language: Language.English,
            genreId: genre.id,
          },
        },
      });

      const foundBooks = await bookRepository.findBooks({
        language: Language.Polish,
        page: 1,
        pageSize: 10,
      });

      expect(foundBooks.length).toEqual(1);

      expect(foundBooks[0]?.getId()).toEqual(book1.id);
    });

    it('finds books by release year after date', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
            releaseYear: 1995,
          },
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
            releaseYear: 1997,
          },
        },
      });

      const foundBooks = await bookRepository.findBooks({
        releaseYearAfter: 1996,
        page: 1,
        pageSize: 10,
      });

      expect(foundBooks.length).toEqual(1);

      expect(foundBooks[0]?.getId()).toEqual(book2.id);
    });

    it('finds books by release year before date', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            releaseYear: 1995,
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            releaseYear: 1997,
            genreId: genre.id,
          },
        },
      });

      const foundBooks = await bookRepository.findBooks({
        releaseYearBefore: 1996,
        page: 1,
        pageSize: 10,
      });

      expect(foundBooks.length).toEqual(1);

      expect(foundBooks[0]?.getId()).toEqual(book1.id);
    });

    it('finds books by release year between dates', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            releaseYear: 1995,
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            releaseYear: 1997,
            genreId: genre.id,
          },
        },
      });

      const foundBooks = await bookRepository.findBooks({
        releaseYearAfter: 1994,
        releaseYearBefore: 1996,
        page: 1,
        pageSize: 10,
      });

      expect(foundBooks.length).toEqual(1);

      expect(foundBooks[0]?.getId()).toEqual(book1.id);
    });

    it('finds books sorted by createdAt', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const foundBooks1 = await bookRepository.findBooks({
        page: 1,
        pageSize: 10,
        sortField: 'createdAt',
        sortOrder: 'asc',
      });

      expect(foundBooks1.length).toEqual(2);

      expect(foundBooks1[0]?.getId()).toEqual(book1.id);

      expect(foundBooks1[1]?.getId()).toEqual(book2.id);

      const foundBooks2 = await bookRepository.findBooks({
        page: 1,
        pageSize: 10,
        sortField: 'createdAt',
        sortOrder: 'desc',
      });

      expect(foundBooks2.length).toEqual(2);

      expect(foundBooks2[0]?.getId()).toEqual(book2.id);

      expect(foundBooks2[1]?.getId()).toEqual(book1.id);
    });

    it('finds books sorted by releaseYear', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            releaseYear: 1995,
            genreId: genre.id,
          },
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            releaseYear: 2019,
            genreId: genre.id,
          },
        },
      });

      const foundBooks1 = await bookRepository.findBooks({
        page: 1,
        pageSize: 10,
        sortField: 'releaseYear',
        sortOrder: 'asc',
      });

      expect(foundBooks1.length).toEqual(2);

      expect(foundBooks1[0]?.getId()).toEqual(book1.id);

      expect(foundBooks1[1]?.getId()).toEqual(book2.id);

      const foundBooks2 = await bookRepository.findBooks({
        page: 1,
        pageSize: 10,
        sortField: 'releaseYear',
        sortOrder: 'desc',
      });

      expect(foundBooks2.length).toEqual(2);

      expect(foundBooks2[0]?.getId()).toEqual(book2.id);

      expect(foundBooks2[1]?.getId()).toEqual(book1.id);
    });

    it('finds books sorted by title', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: 'Harry Potter',
            genreId: genre.id,
          },
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: 'Alice in Wonderland',
            genreId: genre.id,
          },
        },
      });

      const foundBooks1 = await bookRepository.findBooks({
        page: 1,
        pageSize: 10,
        sortField: 'title',
        sortOrder: 'asc',
      });

      expect(foundBooks1.length).toEqual(2);

      expect(foundBooks1[0]?.getId()).toEqual(book2.id);

      expect(foundBooks1[1]?.getId()).toEqual(book1.id);

      const foundBooks2 = await bookRepository.findBooks({
        page: 1,
        pageSize: 10,
        sortField: 'title',
        sortOrder: 'desc',
      });

      expect(foundBooks2.length).toEqual(2);

      expect(foundBooks2[0]?.getId()).toEqual(book1.id);

      expect(foundBooks2[1]?.getId()).toEqual(book2.id);
    });
  });

  describe('count', () => {
    it('counts books', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const count = await bookRepository.countBooks({});

      expect(count).toEqual(5);
    });

    it('counts approved books', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: { isApproved: true, genreId: genre.id },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: { isApproved: true, genreId: genre.id },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: { isApproved: false, genreId: genre.id },
        },
      });

      const count = await bookRepository.countBooks({ isApproved: true });

      expect(count).toEqual(2);
    });

    it('counts books by author ids', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const count = await bookRepository.countBooks({ authorIds: [author1.id] });

      expect(count).toEqual(1);
    });

    it('counts books by language', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            language: Language.Polish,
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            language: Language.English,
            genreId: genre.id,
          },
        },
      });

      await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            language: Language.German,
            genreId: genre.id,
          },
        },
      });

      const count = await bookRepository.countBooks({ language: Language.Polish });

      expect(count).toEqual(1);
    });
  });

  describe('delete', () => {
    it('deletes book', async () => {
      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      await bookRepository.deleteBook({ id: book.id });

      const foundBook = await bookTestUtils.findById({ id: book.id });

      expect(foundBook).toBeUndefined();
    });
  });
});
