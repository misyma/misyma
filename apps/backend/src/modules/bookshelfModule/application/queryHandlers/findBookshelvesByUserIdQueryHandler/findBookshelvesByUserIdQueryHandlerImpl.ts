import {
  type FindBookshelvesByUserIdPayload,
  type FindBookshelvesByUserIdQueryHandler,
  type FindBookshelvesByUserIdResult,
} from './findBookshelvesByUserIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserRepository } from '../../../../userModule/domain/repositories/userRepository/userRepository.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class FindBookshelvesByUserIdQueryHandlerImpl implements FindBookshelvesByUserIdQueryHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(payload: FindBookshelvesByUserIdPayload): Promise<FindBookshelvesByUserIdResult> {
    const { userId, page, pageSize } = payload;

    const existingUser = await this.userRepository.findUser({
      id: userId,
    });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        resource: 'User',
      });
    }

    const findBookshelvesPayload = {
      userId,
      page,
      pageSize,
    };

    const [bookshelves, total] = await Promise.all([
      this.bookshelfRepository.findBookshelves(findBookshelvesPayload),
      this.bookshelfRepository.countBookshelves(findBookshelvesPayload),
    ]);

    return {
      bookshelves,
      total,
    };
  }
}
