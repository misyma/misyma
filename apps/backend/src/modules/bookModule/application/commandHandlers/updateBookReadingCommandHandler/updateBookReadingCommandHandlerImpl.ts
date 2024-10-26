import {
  type UpdateBookReadingCommandHandler,
  type UpdateBookReadingPayload,
  type UpdateBookReadingResult,
} from './updateBookReadingCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class UpdateBookReadingCommandHandlerImpl implements UpdateBookReadingCommandHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateBookReadingPayload): Promise<UpdateBookReadingResult> {
    const { userId, bookReadingId, comment, rating, startedAt, endedAt } = payload;

    this.loggerService.debug({
      message: 'Updating BookReading...',
      id: bookReadingId,
      comment,
      rating,
      startedAt,
      endedAt,
    });

    const bookReading = await this.bookReadingRepository.findBookReading({ id: bookReadingId });

    if (!bookReading) {
      throw new OperationNotValidError({
        reason: 'BookReading does not exist.',
        id: bookReadingId,
      });
    }

    const { userId: ownerId } = await this.userBookRepository.findUserBookOwner({
      id: bookReading.getUserBookId(),
    });

    if (userId !== ownerId) {
      throw new OperationNotValidError({
        reason: 'User does not own the BookReading.',
        userId,
        bookReadingId,
      });
    }

    if (comment !== undefined) {
      bookReading.setComment({
        comment,
      });
    }

    if (rating !== undefined) {
      bookReading.setRating({
        rating,
      });
    }

    if (startedAt !== undefined && endedAt !== undefined) {
      bookReading.setReadingDates({
        startedAt,
        endedAt,
      });
    } else {
      if (startedAt !== undefined) {
        bookReading.setStartedAtDate({
          startedAt,
        });
      }

      if (endedAt !== undefined) {
        bookReading.setEndedAtDate({
          endedAt,
        });
      }
    }

    const updatedBookReading = await this.bookReadingRepository.saveBookReading({
      bookReading,
    });

    this.loggerService.debug({
      message: 'BookReading updated.',
      id: bookReadingId,
      comment,
      rating,
      startedAt,
      endedAt,
    });

    return {
      bookReading: updatedBookReading,
    };
  }
}
