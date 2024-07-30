import {
  type FindBorrowingsQueryHandlerPayload,
  type FindBorrowingsQueryHandler,
  type FindBorrowingsQueryHandlerResult,
} from './findBorrowingsQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import {
  type FindBorrowingsPayload,
  type BorrowingRepository,
} from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindBorrowingsQueryHandlerImpl implements FindBorrowingsQueryHandler {
  public constructor(
    private readonly borrowingRepository: BorrowingRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  public async execute(payload: FindBorrowingsQueryHandlerPayload): Promise<FindBorrowingsQueryHandlerResult> {
    const { userBookId, page, pageSize, sortDate, isOpen } = payload;

    const bookExists = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!bookExists) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
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
