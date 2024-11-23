import {
  type FindUserBooksQueryHandlerPayload,
  type FindUserBooksQueryHandler,
  type FindUserBooksQueryHandlerResult,
} from './findUserBooksQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindUserBooksQueryHandlerImpl implements FindUserBooksQueryHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly collectionRepository: CollectionRepository,
  ) {}

  public async execute(payload: FindUserBooksQueryHandlerPayload): Promise<FindUserBooksQueryHandlerResult> {
    const { bookshelfId, requesterUserId, userId, collectionId, page, pageSize, isbn, sortDate, expandFields } =
      payload;

    if (bookshelfId) {
      await this.validateBookshelf({
        bookshelfId,
        requesterUserId,
      });
    }

    if (collectionId) {
      await this.validateCollection({
        collectionId,
        requesterUserId,
      });
    }

    if (userId) {
      await this.validateUser({
        userId,
        requesterUserId,
      });
    }

    const [userBooks, total] = await Promise.all([
      await this.userBookRepository.findUserBooks({
        bookshelfId,
        collectionId,
        userId,
        isbn,
        page,
        pageSize,
        sortDate,
        expandFields: expandFields ?? [],
      }),
      await this.userBookRepository.countUserBooks({
        bookshelfId,
        collectionId,
        userId,
        isbn,
      }),
    ]);

    return {
      userBooks,
      total,
    };
  }

  private async validateBookshelf({
    bookshelfId,
    requesterUserId,
  }: {
    readonly bookshelfId: string;
    readonly requesterUserId: string;
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

    if (bookshelf.getUserId() !== requesterUserId) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        id: bookshelfId,
      });
    }
  }

  public async validateCollection({
    collectionId,
    requesterUserId,
  }: {
    readonly collectionId: string;
    readonly requesterUserId: string;
  }): Promise<void> {
    const collection = await this.collectionRepository.findCollection({ id: collectionId });

    if (!collection) {
      throw new ResourceNotFoundError({
        resource: 'Collection',
        id: collectionId,
      });
    }

    if (collection.getUserId() !== requesterUserId) {
      throw new ResourceNotFoundError({
        resource: 'Collection',
        id: collectionId,
      });
    }
  }

  public async validateUser({
    userId,
    requesterUserId,
  }: {
    readonly userId: string;
    readonly requesterUserId: string;
  }): Promise<void> {
    if (userId !== requesterUserId) {
      throw new ResourceNotFoundError({
        resource: 'User',
        id: userId,
      });
    }
  }
}
