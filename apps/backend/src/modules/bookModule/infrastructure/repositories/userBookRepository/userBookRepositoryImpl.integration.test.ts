import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Genre } from '../../../domain/entities/genre/genre.js';
import { UserBook } from '../../../domain/entities/userBook/userBook.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { symbols } from '../../../symbols.js';
import { UserBookTestFactory } from '../../../tests/factories/userBookTestFactory/userBookTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('UserBookRepositoryImpl', () => {
  let userBookRepository: UserBookRepository;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let genreTestUtils: GenreTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const userBookTestFactory = new UserBookTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    userBookRepository = container.get<UserBookRepository>(symbols.userBookRepository);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    await authorTestUtils.truncate();

    await userBookTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await userBookTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await genreTestUtils.truncate();

    await databaseClient.destroy();
  });

  describe('saveUserBook', () => {
    it('creates UserBook', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const genreRawEntity = await genreTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = userBookTestFactory.createRaw({
        bookId: book.id,
        bookshelfId: bookshelf.id,
      });

      const genre = new Genre(genreRawEntity);

      const userBook = await userBookRepository.saveUserBook({
        userBook: {
          bookId: userBookRawEntity.bookId,
          bookshelfId: userBookRawEntity.bookshelfId,
          status: userBookRawEntity.status,
          isFavorite: userBookRawEntity.isFavorite,
          imageUrl: userBookRawEntity.imageUrl as string,
          genres: [genre],
        },
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getId(),
      });

      expect(userBook.getState()).toEqual({
        bookId: userBookRawEntity.bookId,
        bookshelfId: userBookRawEntity.bookshelfId,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.imageUrl,
        isFavorite: userBookRawEntity.isFavorite,
        genres: [genre],
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: Boolean(book.isApproved),
          imageUrl: book.imageUrl,
          authors: [
            {
              id: author.id,
              state: {
                name: author.name,
                isApproved: author.isApproved,
              },
            },
          ],
        },
      });

      expect(foundUserBook).toEqual({
        id: userBook.getId(),
        bookId: userBookRawEntity.bookId,
        bookshelfId: userBookRawEntity.bookshelfId,
        status: userBookRawEntity.status,
        isFavorite: userBookRawEntity.isFavorite,
        imageUrl: userBookRawEntity.imageUrl,
      });
    });

    it('updates UserBook bookshelf', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newBookshelfId = bookshelf2.id;

      userBook.setBookshelfId({ bookshelfId: newBookshelfId });

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getId(),
      });

      expect(updatedUserBook.getState()).toEqual({
        bookId: userBook.getBookId(),
        bookshelfId: newBookshelfId,
        status: userBook.getStatus(),
        isFavorite: userBook.getIsFavorite(),
        imageUrl: userBook.getImageUrl(),
        genres: [],
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: Boolean(book.isApproved),
          imageUrl: book.imageUrl,
          authors: [
            {
              id: author.id,
              state: {
                name: author.name,
                isApproved: author.isApproved,
              },
            },
          ],
        },
      });

      expect(foundUserBook).toEqual({
        id: userBook.getId(),
        bookId: userBook.getBookId(),
        bookshelfId: newBookshelfId,
        status: userBook.getStatus(),
        isFavorite: userBook.getIsFavorite(),
        imageUrl: userBook.getImageUrl(),
      });
    });

    it('updates UserBook status', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newStatus = Generator.readingStatus();

      userBook.setStatus({ status: newStatus });

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getId(),
      });

      expect(updatedUserBook.getStatus()).toEqual(newStatus);

      expect(foundUserBook?.status).toEqual(newStatus);
    });

    it('updates UserBook image', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newImageUrl = Generator.imageUrl();

      userBook.setImageUrl({ imageUrl: newImageUrl });

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getId(),
      });

      expect(updatedUserBook.getImageUrl()).toEqual(newImageUrl);

      expect(foundUserBook?.imageUrl).toEqual(newImageUrl);
    });

    it('deletes UserBook image', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newImageUrl = null;

      userBook.setImageUrl({ imageUrl: newImageUrl });

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getId(),
      });

      expect(updatedUserBook.getImageUrl()).toBeUndefined();

      expect(foundUserBook?.imageUrl).toBeNull();
    });

    it('updates UserBook favorite status', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newIsFavorite = Generator.boolean();

      userBook.setIsFavorite({ isFavorite: newIsFavorite });

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getId(),
      });

      expect(updatedUserBook.getIsFavorite()).toEqual(newIsFavorite);

      expect(foundUserBook?.isFavorite).toEqual(newIsFavorite);
    });

    it('sets UserBook Genres', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const genre1 = await genreTestUtils.createAndPersist();

      const genre2 = await genreTestUtils.createAndPersist();

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      userBook.setGenres({ genres: [new Genre(genre1), new Genre(genre2)] });

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const userBookGenres = await userBookTestUtils.findUserBookGenres({
        userBookId: userBook.getId(),
      });

      expect(userBookGenres).toHaveLength(2);

      userBookGenres.forEach((updatedBookGenre) => {
        expect(updatedBookGenre.genreId).oneOf([genre1.id, genre2.id]);

        expect(updatedBookGenre.userBookId).toEqual(updatedUserBook.getId());
      });
    });
  });

  describe('saveUserBooks', () => {
    it('updates UserBooks bookshelves', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

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

      const userBookRawEntity1 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBookRawEntity2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBook1 = new UserBook({
        ...userBookRawEntity1,
        genres: [],
      });

      const userBook2 = new UserBook({
        ...userBookRawEntity2,
        genres: [],
      });

      userBook1.setBookshelfId({ bookshelfId: bookshelf2.id });

      userBook2.setBookshelfId({ bookshelfId: bookshelf2.id });

      await userBookRepository.saveUserBooks({
        userBooks: [userBook1, userBook2],
      });

      const foundUserBooks = await userBookTestUtils.findByIds({ ids: [userBook1.getId(), userBook2.getId()] });

      expect(foundUserBooks.length).toEqual(2);

      foundUserBooks.forEach((foundUserBook) => {
        expect(foundUserBook.bookshelfId).toEqual(bookshelf2.id);
      });
    });
  });

  describe('findUserBook', () => {
    it('finds UserBook by id', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
        genreIds: [genre.id],
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const foundUserBook = await userBookRepository.findUserBook({ id: userBook.getId() });

      expect(foundUserBook?.getId()).toEqual(userBook.getId());

      expect(foundUserBook?.getState()).toEqual({
        bookId: userBook.getBookId(),
        bookshelfId: userBook.getBookshelfId(),
        status: userBook.getStatus(),
        isFavorite: userBook.getIsFavorite(),
        imageUrl: userBook.getImageUrl(),
        genres: [
          {
            id: genre.id,
            state: {
              name: genre.name,
            },
          },
        ],
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: Boolean(book.isApproved),
          imageUrl: book.imageUrl,
          authors: [
            {
              id: author.id,
              state: {
                name: author.name,
                isApproved: author.isApproved,
              },
            },
          ],
        },
      });
    });

    it('returns null if UserBook with given id does not exist', async () => {
      const id = Generator.uuid();

      const userBook = await userBookRepository.findUserBook({ id });

      expect(userBook).toBeNull();
    });
  });

  describe('findUserBooks', () => {
    it('returns UserBooks from a given Bookshelf', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBook3 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        ids: [],
        bookshelfId: bookshelf2.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(2);

      userBooks.forEach((userBook) => {
        expect(userBook.getId()).oneOf([userBook2.id, userBook3.id]);
      });
    });
  });

  describe('findUserBooksByUser', () => {
    it('returns UserBooks from a given User', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user2.id,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBook3 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooksByUser({
        userId: user2.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(2);

      userBooks.forEach((userBook) => {
        expect(userBook.getId()).oneOf([userBook2.id, userBook3.id]);
      });
    });

    it('returns UserBooks from a given User and Book', async () => {
      const user = await userTestUtils.createAndPersist();

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

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooksByUser({
        userId: user.id,
        bookId: book2.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      expect(userBooks[0]?.getId()).toEqual(userBook.id);
    });
  });

  describe('deleteUserBook', () => {
    it('deletes UserBook', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

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

      await userBookRepository.deleteUserBooks({ ids: [userBook.id] });

      const foundBookBook = await bookTestUtils.findById({ id: userBook.id });

      expect(foundBookBook).toBeUndefined();
    });
  });
});
