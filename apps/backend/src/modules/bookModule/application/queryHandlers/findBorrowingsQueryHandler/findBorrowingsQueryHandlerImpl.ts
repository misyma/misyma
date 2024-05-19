import {
  type FindBorrowingsPayload,
  type FindBorrowingsQueryHandler,
  type FindBorrowingsResult,
} from './findBorrowingsQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindBorrowingsQueryHandlerImpl implements FindBorrowingsQueryHandler {
  public constructor(
    private readonly borrowingRepository: BorrowingRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  public async execute(payload: FindBorrowingsPayload): Promise<FindBorrowingsResult> {
    const { userBookId, page, pageSize } = payload;

    const bookExists = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!bookExists) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    const findBorrowingsPayload = {
      userBookId,
      page,
      pageSize,
    };

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
