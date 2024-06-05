import {
  type FindUserBooksPayload,
  type FindUserBooksQueryHandler,
  type FindUserBooksResult,
} from './findUserBooksQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';
import {
  type UserBookRepository,
  type FindUserBooksPayload as FinUserBooksDomainPayload,
} from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindUserBooksQueryHandlerImpl implements FindUserBooksQueryHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly collectionRepository: CollectionRepository,
  ) {}

  public async execute(payload: FindUserBooksPayload): Promise<FindUserBooksResult> {
    const { bookshelfId, userId, collectionId, page, pageSize, isbn } = payload;

    await this.validateBookshelf({
      bookshelfId,
      userId,
    });

    await this.validateCollection({
      collectionId,
      userId,
    });

    const findUserBooksPayload: FinUserBooksDomainPayload = {
      bookshelfId,
      collectionId,
      isbn,
      page,
      pageSize,
    };

    const [userBooks, total] = await Promise.all([
      await this.userBookRepository.findUserBooks(findUserBooksPayload),
      await this.userBookRepository.countUserBooks(findUserBooksPayload),
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
    readonly bookshelfId: string | undefined;
    readonly userId: string | undefined;
  }): Promise<void> {
    if (!bookshelfId) {
      return;
    }

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

    if (userId && bookshelf.getUserId() !== userId) {
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
    readonly collectionId: string | undefined;
    readonly userId: string | undefined;
  }): Promise<void> {
    if (!collectionId) {
      return;
    }

    const collection = await this.collectionRepository.findCollection({ id: collectionId });

    if (!collection) {
      throw new ResourceNotFoundError({
        resource: 'Collection',
        id: collectionId,
      });
    }

    if (userId && collection.getUserId() !== userId) {
      throw new ResourceNotFoundError({
        resource: 'Collection',
        id: collectionId,
      });
    }
  }
}
