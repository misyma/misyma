import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('AuthorRepositoryImpl', () => {
  let authorRepository: AuthorRepository;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let genreTestUtils: GenreTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    authorRepository = container.get<AuthorRepository>(symbols.authorRepository);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    testUtils = [genreTestUtils, authorTestUtils, bookTestUtils, bookshelfTestUtils, userTestUtils, userBookTestUtils];

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

  describe('Create', () => {
    it('creates a author', async () => {
      const { name, isApproved, createdAt } = authorTestFactory.createRaw();

      const author = await authorRepository.saveAuthor({
        author: {
          name,
          isApproved,
          createdAt,
        },
      });

      const foundAuthor = await authorTestUtils.findByName({
        name,
      });

      expect(author.getName()).toEqual(name);

      expect(author.getIsApproved()).toEqual(isApproved);

      expect(foundAuthor?.name).toEqual(name);

      expect(foundAuthor?.isApproved).toEqual(isApproved);

      expect(foundAuthor?.createdAt).toEqual(createdAt);
    });

    it('throws an error when author with the same name already exists', async () => {
      const existingAuthor = await authorTestUtils.createAndPersist();

      try {
        await authorRepository.saveAuthor({
          author: {
            name: existingAuthor.name,
            isApproved: existingAuthor.isApproved,
            createdAt: existingAuthor.createdAt,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        return;
      }

      expect.fail();
    });
  });

  describe('Find', () => {
    it('finds author by id', async () => {
      const author = await authorTestUtils.createAndPersist();

      const foundAuthor = await authorRepository.findAuthor({ id: author.id });

      expect(foundAuthor).not.toBeNull();
    });

    it('returns null if author with given id does not exist', async () => {
      const { id } = authorTestFactory.createRaw();

      const author = await authorRepository.findAuthor({ id });

      expect(author).toBeNull();
    });
  });

  describe('Delete', () => {
    it('deletes author', async () => {
      const author = await authorTestUtils.createAndPersist();

      await authorRepository.deleteAuthor({ id: author.id });

      const foundAuthor = await authorTestUtils.findById({ id: author.id });

      expect(foundAuthor).toBeUndefined();
    });
  });

  describe('findAuthors', () => {
    it('returns an empty array - when no Authors were found', async () => {
      const nonExistentAuthorIds = Array.from({ length: Generator.number(1, 20) }).map(() => Generator.uuid());

      const authors = await authorRepository.findAuthors({
        ids: nonExistentAuthorIds,
        page: 1,
        pageSize: 10,
      });

      expect(authors).toEqual([]);
    });

    it('returns an array of Authors - when all Authors were found', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const foundAuthors = await authorRepository.findAuthors({
        ids: [author1.id, author2.id, author3.id],
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors).toHaveLength(3);

      foundAuthors.forEach((foundAuthor) => {
        expect(foundAuthor.getId()).oneOf([author1.id, author2.id, author3.id]);

        expect(foundAuthor.getName()).oneOf([author1.name, author2.name, author3.name]);
      });
    });

    it('returns no authors when given partial name does not match any author name', async () => {
      await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolkien',
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolstoy',
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          name: 'Rowling',
        },
      });

      const partialName = 'Mar';

      const foundAuthors = await authorRepository.findAuthors({
        name: partialName,
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors).toHaveLength(0);
    });

    it('returns authors when given partial name that matches author name', async () => {
      const author1 = await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolkien',
        },
      });

      const author2 = await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolstoy',
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          name: 'Rowling',
        },
      });

      const foundAuthors1 = await authorRepository.findAuthors({
        name: 'tol',
        page: 1,
        pageSize: 10,
      });

      const foundAuthors2 = await authorRepository.findAuthors({
        name: 'Tol',
        page: 1,
        pageSize: 10,
      });

      const foundAuthors3 = await authorRepository.findAuthors({
        name: 'TOL',
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors1).toHaveLength(2);

      expect(foundAuthors2).toHaveLength(2);

      expect(foundAuthors3).toHaveLength(2);

      [foundAuthors1, foundAuthors2, foundAuthors3].forEach((foundAuthors) => {
        foundAuthors.forEach((foundAuthor) => {
          expect(foundAuthor.getId()).oneOf([author1.id, author2.id]);

          expect(foundAuthor.getName()).oneOf([author1.name, author2.name]);
        });
      });
    });

    it('returns authors when given partial name that matches author name - case insensitive', async () => {
      const author1 = await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolkien',
        },
      });

      const author2 = await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolstoy',
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          name: 'Rowling',
        },
      });

      const foundAuthors1 = await authorRepository.findAuthors({
        name: 'tol',
        page: 1,
        pageSize: 10,
      });

      const foundAuthors2 = await authorRepository.findAuthors({
        name: 'Tol',
        page: 1,
        pageSize: 10,
      });

      const foundAuthors3 = await authorRepository.findAuthors({
        name: 'TOL',
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors1).toHaveLength(2);

      expect(foundAuthors2).toHaveLength(2);

      expect(foundAuthors3).toHaveLength(2);

      [foundAuthors1, foundAuthors2, foundAuthors3].forEach((foundAuthors) => {
        foundAuthors.forEach((foundAuthor) => {
          expect(foundAuthor.getId()).oneOf([author1.id, author2.id]);

          expect(foundAuthor.getName()).oneOf([author1.name, author2.name]);
        });
      });
    });

    it('finds authors sorted by id ascending', async () => {
      const author1 = await authorTestUtils.createAndPersist({
        input: {
          createdAt: new Date('2021-01-01'),
        },
      });

      const author2 = await authorTestUtils.createAndPersist({
        input: {
          createdAt: new Date('2021-01-02'),
        },
      });

      const author3 = await authorTestUtils.createAndPersist({
        input: {
          createdAt: new Date('2021-01-03'),
        },
      });

      const foundAuthorsAsc = await authorRepository.findAuthors({
        page: 1,
        pageSize: 10,
        sortField: 'createdAt',
        sortOrder: 'asc',
      });

      expect(foundAuthorsAsc).toHaveLength(3);

      expect(foundAuthorsAsc[0]?.getId()).toEqual(author1.id);

      expect(foundAuthorsAsc[1]?.getId()).toEqual(author2.id);

      expect(foundAuthorsAsc[2]?.getId()).toEqual(author3.id);

      const foundAuthorsDesc = await authorRepository.findAuthors({
        page: 1,
        pageSize: 10,
        sortField: 'createdAt',
        sortOrder: 'desc',
      });

      expect(foundAuthorsDesc).toHaveLength(3);

      expect(foundAuthorsDesc[0]?.getId()).toEqual(author3.id);

      expect(foundAuthorsDesc[1]?.getId()).toEqual(author2.id);

      expect(foundAuthorsDesc[2]?.getId()).toEqual(author1.id);
    });

    it('finds authors sorted by name', async () => {
      const author1 = await authorTestUtils.createAndPersist({
        input: {
          name: 'Cieslar',
        },
      });

      const author2 = await authorTestUtils.createAndPersist({
        input: {
          name: 'Rowling',
        },
      });

      const author3 = await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolkien',
        },
      });

      const foundAuthorsAsc = await authorRepository.findAuthors({
        page: 1,
        pageSize: 10,
        sortField: 'name',
        sortOrder: 'asc',
      });

      expect(foundAuthorsAsc).toHaveLength(3);

      expect(foundAuthorsAsc[0]?.getId()).toEqual(author1.id);

      expect(foundAuthorsAsc[1]?.getId()).toEqual(author2.id);

      expect(foundAuthorsAsc[2]?.getId()).toEqual(author3.id);

      const foundAuthorsDesc = await authorRepository.findAuthors({
        page: 1,
        pageSize: 10,
        sortField: 'name',
        sortOrder: 'desc',
      });

      expect(foundAuthorsDesc).toHaveLength(3);

      expect(foundAuthorsDesc[0]?.getId()).toEqual(author3.id);

      expect(foundAuthorsDesc[1]?.getId()).toEqual(author2.id);

      expect(foundAuthorsDesc[2]?.getId()).toEqual(author1.id);
    });

    it('finds authors by userId', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const author4 = await authorTestUtils.createAndPersist();

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

      const book3 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book4 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id, author4.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf3 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf2.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book3.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book4.id,
        },
      });

      const foundAuthors = await authorRepository.findAuthors({
        userId: user2.id,
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors).toHaveLength(2);

      foundAuthors.forEach((foundAuthor) => {
        expect(foundAuthor.getId()).oneOf([author3.id, author4.id]);
      });
    });

    it('finds authors by bookshelfId', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const author4 = await authorTestUtils.createAndPersist();

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

      const book3 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book4 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id, author4.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf3 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf2.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book3.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book4.id,
        },
      });

      const foundAuthors = await authorRepository.findAuthors({
        bookshelfId: bookshelf2.id,
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors).toHaveLength(1);

      expect(foundAuthors[0]?.getId()).toEqual(author2.id);
    });

    it('finds authors by userId and bookshelfId', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const author4 = await authorTestUtils.createAndPersist();

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

      const book3 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book4 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id, author4.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf3 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf2.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book3.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book4.id,
        },
      });

      const foundAuthors = await authorRepository.findAuthors({
        userId: user1.id,
        bookshelfId: bookshelf1.id,
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors).toHaveLength(2);

      foundAuthors.forEach((foundAuthor) => {
        expect(foundAuthor.getId()).oneOf([author1.id, author2.id]);
      });

      const foundAuthors2 = await authorRepository.findAuthors({
        userId: user1.id,
        bookshelfId: bookshelf2.id,
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors2).toHaveLength(1);

      expect(foundAuthors2[0]?.getId()).toEqual(author2.id);
    });

    it('finds authors by isApproved', async () => {
      const author1 = await authorTestUtils.createAndPersist({
        input: {
          isApproved: true,
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          isApproved: false,
        },
      });

      const author3 = await authorTestUtils.createAndPersist({
        input: {
          isApproved: true,
        },
      });

      const foundAuthors = await authorRepository.findAuthors({
        isApproved: true,
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors).toHaveLength(2);

      foundAuthors.forEach((foundAuthor) => {
        expect(foundAuthor.getId()).oneOf([author1.id, author3.id]);
      });
    });
  });

  describe('count', () => {
    it('returns 0 - when no Authors were found', async () => {
      const count = await authorRepository.countAuthors({});

      expect(count).toEqual(0);
    });

    it('returns the number of Authors found', async () => {
      await authorTestUtils.createAndPersist();

      await authorTestUtils.createAndPersist();

      await authorTestUtils.createAndPersist();

      const count = await authorRepository.countAuthors({});

      expect(count).toEqual(3);
    });

    it('returns the number of Authors found by name', async () => {
      await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolkien',
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolstoy',
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          name: 'Rowling',
        },
      });

      const count = await authorRepository.countAuthors({
        name: 'tol',
      });

      expect(count).toEqual(2);
    });

    it('returns the number of Authors found by isApproved', async () => {
      await authorTestUtils.createAndPersist({
        input: {
          isApproved: true,
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          isApproved: false,
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          isApproved: true,
        },
      });

      const count = await authorRepository.countAuthors({
        isApproved: true,
      });

      expect(count).toEqual(2);
    });

    it('returns the number of Authors found by userId', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const author4 = await authorTestUtils.createAndPersist();

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

      const book3 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book4 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id, author4.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf3 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf2.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book3.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book4.id,
        },
      });

      const count = await authorRepository.countAuthors({
        userId: user2.id,
      });

      expect(count).toEqual(2);
    });

    it('returns the number of Authors found by bookshelfId', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const author4 = await authorTestUtils.createAndPersist();

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

      const book3 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const book4 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author3.id, author4.id],
          book: {
            genreId: genre.id,
          },
        },
      });

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf3 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf1.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf2.id,
          bookId: book2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book3.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf3.id,
          bookId: book4.id,
        },
      });

      const count = await authorRepository.countAuthors({
        bookshelfId: bookshelf3.id,
      });

      expect(count).toEqual(2);
    });
  });
});
