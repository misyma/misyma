import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBookRepository } from '../../../../bookModule/domain/repositories/userBookRepository/userBookRepository.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

import {
  type CreateBookReadingCommandHandler,
  type CreateBookReadingPayload,
  type CreateBookReadingResult,
} from './createBookReadingCommandHandler.js';

export class CreateBookReadingCommandHandlerImpl implements CreateBookReadingCommandHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateBookReadingPayload): Promise<CreateBookReadingResult> {
    const { userId, userBookId, comment, rating, startedAt, endedAt } = payload;

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
      throw new OperationNotValidError({
        reason: 'UserBook does not exist.',
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

    if (startedAt.getTime() > endedAt.getTime()) {
      throw new OperationNotValidError({
        reason: `Start date cannot be later than end date.`,
        startedAt,
        endedAt,
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
