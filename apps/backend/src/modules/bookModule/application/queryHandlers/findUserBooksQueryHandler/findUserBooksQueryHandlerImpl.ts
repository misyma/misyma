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
    const { bookshelfId, userId, ids } = payload;

    await this.validateBookshelf({
      bookshelfId,
      userId,
    });

    const userBooks = await this.userBookRepository.findUserBooks({
      bookshelfId,
      ids: ids ?? [],
    });

    return { userBooks };
  }

  private async validateBookshelf({ bookshelfId, userId }: Omit<FindUserBooksPayload, 'ids'>): Promise<void> {
    if (bookshelfId) {
      const bookshelf = await this.bookshelfRepository.findBookshelf({
        where: {
          id: bookshelfId,
        },
      });

      if (!bookshelf) {
        throw new ResourceNotFoundError({
          name: 'Bookshelf',
          id: bookshelfId,
        });
      }

      if (userId) {
        if (bookshelf.getUserId() !== userId) {
          throw new ResourceNotFoundError({
            name: 'Bookshelf',
            id: bookshelfId,
          });
        }
      }
    }
  }
}
