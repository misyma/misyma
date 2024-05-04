import {
  type CreateBookReadingCommandHandler,
  type CreateBookReadingPayload,
  type CreateBookReadingResult,
} from './createBookReadingCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBookRepository } from '../../../../bookModule/domain/repositories/userBookRepository/userBookRepository.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class CreateBookReadingCommandHandlerImpl implements CreateBookReadingCommandHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateBookReadingPayload): Promise<CreateBookReadingResult> {
    const { userBookId, comment, rating, startedAt, endedAt } = payload;

    this.loggerService.debug({
      message: 'Creating BookReading...',
      userBookId,
      comment,
      rating,
      startedAt,
      endedAt,
    });

    const existingUserBook = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!existingUserBook) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    const bookReading = await this.bookReadingRepository.saveBookReading({
      bookReading: {
        userBookId,
        comment,
        rating,
        startedAt,
        endedAt,
      },
    });

    this.loggerService.debug({
      message: 'BookReading created.',
      id: bookReading.getId(),
      userBookId,
      comment,
      rating,
      startedAt,
      endedAt,
    });

    return { bookReading };
  }
}
