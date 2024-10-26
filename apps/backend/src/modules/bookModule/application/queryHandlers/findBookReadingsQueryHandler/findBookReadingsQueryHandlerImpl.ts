import {
  type FindBookReadingsQueryHandlerPayload,
  type FindBookReadingsQueryHandler,
  type FindBookReadingsQueryHandlerResult,
} from './findBookReadingsQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import {
  type FindBookReadingsPayload as FindDomainBookReadingsPayload,
  type BookReadingRepository,
} from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindBookReadingsueryHandlerImpl implements FindBookReadingsQueryHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  public async execute(payload: FindBookReadingsQueryHandlerPayload): Promise<FindBookReadingsQueryHandlerResult> {
    const { userId, userBookId, page, pageSize, sortDate } = payload;

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

    let findBookReadingsPayload: FindDomainBookReadingsPayload = {
      userBookId,
      page,
      pageSize,
    };

    if (sortDate) {
      findBookReadingsPayload = {
        ...findBookReadingsPayload,
        sortDate,
      };
    }

    const [bookReadings, total] = await Promise.all([
      this.bookReadingRepository.findBookReadings(findBookReadingsPayload),
      this.bookReadingRepository.countBookReadings(findBookReadingsPayload),
    ]);

    return {
      bookReadings,
      total,
    };
  }
}
