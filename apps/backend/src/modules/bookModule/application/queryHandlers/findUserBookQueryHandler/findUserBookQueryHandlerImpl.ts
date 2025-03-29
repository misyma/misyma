import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import {
  type FindUserBookQueryHandler,
  type FindUserBookQueryHandlerPayload,
  type FindUserBookQueryHandlerResult,
} from './findUserBookQueryHandler.js';

export class FindUserBookQueryHandlerImpl implements FindUserBookQueryHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
  ) {}

  public async execute(payload: FindUserBookQueryHandlerPayload): Promise<FindUserBookQueryHandlerResult> {
    const { userId, userBookId } = payload;

    const userBook = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!userBook) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    const bookshelf = await this.bookshelfRepository.findBookshelf({
      where: { id: userBook.getBookshelfId() },
    });

    if (!bookshelf) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        id: userBook.getBookshelfId(),
      });
    }

    if (bookshelf.getUserId() !== userId) {
      throw new OperationNotValidError({
        reason: 'User does not own this UserBook.',
        userId,
        userBookId,
      });
    }

    return { userBook };
  }
}
