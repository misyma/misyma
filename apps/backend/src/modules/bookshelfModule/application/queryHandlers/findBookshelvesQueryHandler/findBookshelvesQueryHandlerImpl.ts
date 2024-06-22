import {
  type FindBookshelvesQueryHandlerPayload,
  type FindBookshelvesQueryHandler,
  type FindBookshelvesQueryHandlerResult,
} from './findBookshelvesQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserRepository } from '../../../../userModule/domain/repositories/userRepository/userRepository.js';
import {
  type FindBookshelvesPayload,
  type BookshelfRepository,
} from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class FindBookshelvesQueryHandlerImpl implements FindBookshelvesQueryHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(payload: FindBookshelvesQueryHandlerPayload): Promise<FindBookshelvesQueryHandlerResult> {
    const { userId, page, pageSize, sortDate } = payload;

    const existingUser = await this.userRepository.findUser({
      id: userId,
    });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        resource: 'User',
      });
    }

    let findBookshelvesPayload: FindBookshelvesPayload = {
      userId,
      page,
      pageSize,
    };

    if (sortDate) {
      findBookshelvesPayload = {
        ...findBookshelvesPayload,
        sortDate,
      };
    }

    const [bookshelves, total] = await Promise.all([
      this.bookshelfRepository.findBookshelves(findBookshelvesPayload),
      this.bookshelfRepository.countBookshelves({ userId }),
    ]);

    return {
      bookshelves,
      total,
    };
  }
}
