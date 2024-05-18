import {
  type FindUserBooksPayload,
  type FindUserBooksQueryHandler,
  type FindUserBooksResult,
} from './findUserBooksQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindUserBooksQueryHandlerImpl implements FindUserBooksQueryHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
  ) {}

  public async execute(payload: FindUserBooksPayload): Promise<FindUserBooksResult> {
    const { bookshelfId, userId, ids, page, pageSize } = payload;

    await this.validateBookshelf({
      bookshelfId,
      userId,
    });

    const findUserBooksPayload = {
      bookshelfId,
      ids: ids ?? [],
      page,
      pageSize,
    };

    const [userBooks, total] = await Promise.all([
      await this.userBookRepository.findUserBooks(findUserBooksPayload),
      await this.userBookRepository.countUserBooks(findUserBooksPayload),
    ]);

    console.log({
      count: userBooks.length,
      total,
    });

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
    if (bookshelfId) {
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

      if (userId) {
        if (bookshelf.getUserId() !== userId) {
          throw new ResourceNotFoundError({
            resource: 'Bookshelf',
            id: bookshelfId,
          });
        }
      }
    }
  }
}
