import { type FindBooksPayload, type FindBooksQueryHandler, type FindBooksResult } from './findBooksQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class FindBooksQueryHandlerImpl implements FindBooksQueryHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
  ) {}

  public async execute(payload: FindBooksPayload): Promise<FindBooksResult> {
    const { bookshelfId, userId, ids } = payload;

    await this.validateBookshelf({
      bookshelfId,
      userId,
    });

    const books = await this.bookRepository.findBooks({
      bookshelfId,
      ids: ids ?? [],
    });

    return {
      books,
    };
  }

  private async validateBookshelf({ bookshelfId, userId }: Omit<FindBooksPayload, 'ids'>): Promise<void> {
    if (bookshelfId) {
      const bookshelf = await this.bookshelfRepository.findBookshelf({
        id: bookshelfId,
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
