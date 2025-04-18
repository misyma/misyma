import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import {
  type FindUserBooksQueryHandlerPayload,
  type FindUserBooksQueryHandler,
  type FindUserBooksQueryHandlerResult,
} from './findUserBooksQueryHandler.js';

export class FindUserBooksQueryHandlerImpl implements FindUserBooksQueryHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly collectionRepository: CollectionRepository,
  ) {}

  public async execute(payload: FindUserBooksQueryHandlerPayload): Promise<FindUserBooksQueryHandlerResult> {
    const {
      bookshelfId,
      userId,
      collectionId,
      authorId,
      page,
      pageSize,
      isbn,
      title,
      status,
      isFavorite,
      language,
      releaseYearAfter,
      releaseYearBefore,
      sortField,
      sortOrder,
    } = payload;

    if (bookshelfId) {
      await this.validateBookshelf({
        bookshelfId,
        userId,
      });
    }

    if (collectionId) {
      await this.validateCollection({
        collectionId,
        userId,
      });
    }

    const [userBooks, total] = await Promise.all([
      await this.userBookRepository.findUserBooks({
        bookshelfId,
        collectionId,
        authorId,
        userId,
        isbn,
        title,
        status,
        isFavorite,
        language,
        releaseYearAfter,
        releaseYearBefore,
        page,
        pageSize,
        sortField,
        sortOrder,
      }),
      await this.userBookRepository.countUserBooks({
        bookshelfId,
        collectionId,
        authorId,
        userId,
        isbn,
        title,
        status,
        isFavorite,
        language,
        releaseYearAfter,
        releaseYearBefore,
        sortField,
      }),
    ]);

    return {
      userBooks,
      total,
    };
  }

  private async validateBookshelf({
    bookshelfId,
    userId,
  }: {
    readonly bookshelfId: string;
    readonly userId: string;
  }): Promise<void> {
    const bookshelf = await this.bookshelfRepository.findBookshelf({
      where: {
        id: bookshelfId,
      },
    });

    if (!bookshelf) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        id: bookshelfId,
      });
    }

    if (bookshelf.getUserId() !== userId) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        id: bookshelfId,
      });
    }
  }

  public async validateCollection({
    collectionId,
    userId,
  }: {
    readonly collectionId: string;
    readonly userId: string;
  }): Promise<void> {
    const collection = await this.collectionRepository.findCollection({ id: collectionId });

    if (!collection) {
      throw new ResourceNotFoundError({
        resource: 'Collection',
        id: collectionId,
      });
    }

    if (collection.getUserId() !== userId) {
      throw new ResourceNotFoundError({
        resource: 'Collection',
        id: collectionId,
      });
    }
  }
}
