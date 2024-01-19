import {
  type FindBookshelvesByUserIdPayload,
  type FindBookshelvesByUserIdQueryHandler,
  type FindBookshelvesByUserIdResult,
} from './findBookshelvesByUserIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BookshelfUserRepository } from '../../../domain/repositories/bookshelfUserRepository/bookshelfUserRepository.js';

export class FindBookshelvesByUserIdQueryHandlerImpl implements FindBookshelvesByUserIdQueryHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly bookshelfUserRepository: BookshelfUserRepository,
  ) {}

  public async execute(payload: FindBookshelvesByUserIdPayload): Promise<FindBookshelvesByUserIdResult> {
    const { userId } = payload;

    const userExists = await this.bookshelfUserRepository.exists({
      id: userId,
    });

    if (!userExists) {
      throw new ResourceNotFoundError({
        name: 'User',
      });
    }

    const bookshelves = await this.bookshelfRepository.findByUserId({
      userId,
    });

    return {
      bookshelves,
    };
  }
}
