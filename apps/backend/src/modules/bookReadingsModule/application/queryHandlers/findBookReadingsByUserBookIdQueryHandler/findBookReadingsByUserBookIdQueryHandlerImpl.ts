import {
  type FindBookReadingsByUserBookIdPayload,
  type FindBookReadingsByUserBookIdQueryHandler,
  type FindBookReadingsByUserBookIdResult,
} from './findBookReadingsByUserBookIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserBookRepository } from '../../../../bookModule/domain/repositories/userBookRepository/userBookRepository.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class FindBookReadingsByBookIdQueryHandlerImpl implements FindBookReadingsByUserBookIdQueryHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  public async execute(payload: FindBookReadingsByUserBookIdPayload): Promise<FindBookReadingsByUserBookIdResult> {
    const { userBookId } = payload;

    const bookExists = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!bookExists) {
      throw new ResourceNotFoundError({
        name: 'UserBook',
        id: userBookId,
      });
    }

    const bookReadings = await this.bookReadingRepository.findBookReadings({ userBookId });

    return { bookReadings };
  }
}
