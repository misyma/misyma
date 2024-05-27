import {
  type FindBookReadingsByUserBookIdPayload,
  type FindBookReadingsByUserBookIdQueryHandler,
  type FindBookReadingsByUserBookIdResult,
} from './findBookReadingsByUserBookIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import {
  type FindBookReadingsPayload,
  type BookReadingRepository,
} from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class FindBookReadingsByUserBookIdQueryHandlerImpl implements FindBookReadingsByUserBookIdQueryHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  public async execute(payload: FindBookReadingsByUserBookIdPayload): Promise<FindBookReadingsByUserBookIdResult> {
    const { userBookId, page, pageSize, sortDate } = payload;

    const bookExists = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!bookExists) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    let findBookReadingsPayload: FindBookReadingsPayload = {
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
