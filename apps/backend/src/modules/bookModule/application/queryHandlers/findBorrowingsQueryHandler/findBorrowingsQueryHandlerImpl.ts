import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import {
  type FindBorrowingsPayload,
  type BorrowingRepository,
} from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import {
  type FindBorrowingsQueryHandlerPayload,
  type FindBorrowingsQueryHandler,
  type FindBorrowingsQueryHandlerResult,
} from './findBorrowingsQueryHandler.js';

export class FindBorrowingsQueryHandlerImpl implements FindBorrowingsQueryHandler {
  public constructor(
    private readonly borrowingRepository: BorrowingRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  public async execute(payload: FindBorrowingsQueryHandlerPayload): Promise<FindBorrowingsQueryHandlerResult> {
    const { userId, userBookId, page, pageSize, sortDate, isOpen } = payload;

    const bookExists = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!bookExists) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    const { userId: ownerId } = await this.userBookRepository.findUserBookOwner({
      id: userBookId,
    });

    if (userId !== ownerId) {
      throw new OperationNotValidError({
        reason: 'User does not own the UserBook.',
        userId,
        userBookId,
      });
    }

    let findBorrowingsPayload: FindBorrowingsPayload = {
      userBookId,
      page,
      pageSize,
    };

    if (sortDate) {
      findBorrowingsPayload = {
        ...findBorrowingsPayload,
        sortDate,
      };
    }

    if (isOpen !== undefined) {
      findBorrowingsPayload = {
        ...findBorrowingsPayload,
        isOpen,
      };
    }

    const [borrowings, total] = await Promise.all([
      this.borrowingRepository.findBorrowings(findBorrowingsPayload),
      this.borrowingRepository.countBorrowings(findBorrowingsPayload),
    ]);

    return {
      borrowings,
      total,
    };
  }
}
