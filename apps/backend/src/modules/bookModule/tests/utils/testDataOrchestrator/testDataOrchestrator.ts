import { Generator } from '../../../../../../tests/generator.js';
import {
  type CreateAndPersistBookshelfPayload,
  type BookshelfTestUtils,
} from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type BookshelfRawEntity } from '../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfRawEntity.js';
import { type BookRawEntity } from '../../../../databaseModule/infrastructure/tables/bookTable/bookRawEntity.js';
import { type UserBookRawEntity } from '../../../../databaseModule/infrastructure/tables/userBookTable/userBookRawEntity.js';
import { type AuthorTestUtils } from '../authorTestUtils/authorTestUtils.js';
import { type CreateAndPersistBookPayload, type BookTestUtils } from '../bookTestUtils/bookTestUtils.js';
import { type CategoryTestUtils } from '../categoryTestUtils/categoryTestUtils.js';
import {
  type CreateAndPersistUserBookPayload,
  type UserBookTestUtils,
} from '../userBookTestUtils/userBookTestUtils.js';

interface CreateUserBookPayload {
  book?: CreateAndPersistBookPayload['input'];
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
    private readonly categoryTestUtils: CategoryTestUtils,
    private readonly bookshelfTestUtils: BookshelfTestUtils,
    private readonly authorTestUtils: AuthorTestUtils,
    private readonly bookTestUtils: BookTestUtils,
    private readonly userBookTestUtils: UserBookTestUtils,
  ) {}

  public async createUserBook(payload: CreateUserBookPayload = {}): Promise<UserBookRawEntity> {
    const bookshelf = await this.findOrCreateBookshelf(payload.bookshelf);

    const category = await this.categoryTestUtils.createAndPersist();

    const book = await this.bookTestUtils.createAndPersist({
      input: {
        authorIds: payload.book?.authorIds,
        book: {
          category_id: category.id,
          id: payload.book?.book?.id ?? Generator.uuid(),
          ...payload.book?.book,
        },
      },
    });

    return await this.userBookTestUtils.createAndPersist({
      input: {
        book_id: book.id,
        bookshelf_id: bookshelf.id,
        ...payload.userBook?.input,
      },
      collectionIds: payload.userBook?.collectionIds ? payload.userBook.collectionIds : [],
    });
  }

  public async createBook(authorIdOverride?: string, title?: string): Promise<BookRawEntity> {
    const author1 = await this.authorTestUtils.createAndPersist();

    let authorId = author1.id;

    if (authorIdOverride) {
      authorId = authorIdOverride;
    }

    const category = await this.categoryTestUtils.createAndPersist();

    return await this.bookTestUtils.createAndPersist({
      input: {
        authorIds: [authorId],
        book: {
          category_id: category.id,
          title: title ?? Generator.title(),
        },
      },
    });
  }

  public async cleanup(): Promise<void> {
    await this.categoryTestUtils.truncate();
    await this.bookshelfTestUtils.truncate();
    await this.bookTestUtils.truncate();
    await this.userBookTestUtils.truncate();
  }

  public setUserId(id: string): void {
    this.userId = id;
  }

  private async findOrCreateBookshelf(vals?: CreateUserBookPayload['bookshelf']): Promise<BookshelfRawEntity> {
    const createBookshelfCb = async (): Promise<BookshelfRawEntity> =>
      await this.bookshelfTestUtils.createAndPersist({
        input: {
          user_id: this.userId,
          ...vals?.input,
        },
      });

    if (vals?.input?.id) {
      const foundBookshelf = await this.bookshelfTestUtils.findById({
        id: vals.input.id,
      });

      if (foundBookshelf) {
        return foundBookshelf;
      } else {
        return await createBookshelfCb();
      }
    }

    return await createBookshelfCb();
  }
}
