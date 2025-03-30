import {
  type CreateAndPersistBookshelfPayload,
  type BookshelfTestUtils,
} from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type BookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { type UserBookRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';
import { type AuthorTestUtils } from '../authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../genreTestUtils/genreTestUtils.js';
import {
  type CreateAndPersistUserBookPayload,
  type UserBookTestUtils,
} from '../userBookTestUtils/userBookTestUtils.js';

interface CreateUserBookPayload {
  userBook?: {
    input?: Partial<CreateAndPersistUserBookPayload['input']>;
    collectionIds?: CreateAndPersistUserBookPayload['collectionIds'];
  };
  bookshelf?: {
    input?: Partial<CreateAndPersistBookshelfPayload['input']>;
  };
}

export class TestDataOrchestrator {
  public userId: string = '';
  public constructor(
    private readonly genreTestUtils: GenreTestUtils,
    private readonly bookshelfTestUtils: BookshelfTestUtils,
    private readonly authorTestUtils: AuthorTestUtils,
    private readonly bookTestUtils: BookTestUtils,
    private readonly userBookTestUtils: UserBookTestUtils,
  ) {}

  public async createUserBook(payload: CreateUserBookPayload = {}): Promise<UserBookRawEntity> {
    const bookshelf = await this.bookshelfTestUtils.createAndPersist({
      input: {
        userId: this.userId,
        ...payload.bookshelf?.input,
      },
    });

    const genre = await this.genreTestUtils.createAndPersist();

    const book = await this.bookTestUtils.createAndPersist({
      input: {
        book: {
          genreId: genre.id,
        },
      },
    });

    return await this.userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
        ...payload.userBook?.input,
      },
      collectionIds: payload.userBook?.collectionIds ? payload.userBook.collectionIds : [],
    });
  }

  public async createBook(): Promise<BookRawEntity> {
    const author1 = await this.authorTestUtils.createAndPersist();

    const genre = await this.genreTestUtils.createAndPersist();

    return await this.bookTestUtils.createAndPersist({
      input: {
        authorIds: [author1.id],
        book: {
          genreId: genre.id,
        },
      },
    });
  }

  public async cleanup(): Promise<void> {
    await this.genreTestUtils.truncate();
    await this.bookshelfTestUtils.truncate();
    await this.bookTestUtils.truncate();
    await this.userBookTestUtils.truncate();
  }

  public setUserId(id: string): void {
    this.userId = id;
  }
}
