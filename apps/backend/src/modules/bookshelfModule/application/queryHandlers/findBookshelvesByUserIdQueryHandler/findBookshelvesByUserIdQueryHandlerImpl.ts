import {
  type FindBookshelvesByUserIdPayload,
  type FindBookshelvesByUserIdQueryHandler,
  type FindBookshelvesByUserIdResult,
} from './findBookshelvesByUserIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserRepository } from '../../../../userModule/domain/repositories/userRepository/userRepository.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class FindBookshelvesByUserIdQueryHandlerImpl implements FindBookshelvesByUserIdQueryHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(payload: FindBookshelvesByUserIdPayload): Promise<FindBookshelvesByUserIdResult> {
    const { userId } = payload;

    const existingUser = await this.userRepository.findUser({
      id: userId,
    });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'User',
      });
    }

    const bookshelves = await this.bookshelfRepository.findBookshelves({ userId });

    return { bookshelves };
  }
}
