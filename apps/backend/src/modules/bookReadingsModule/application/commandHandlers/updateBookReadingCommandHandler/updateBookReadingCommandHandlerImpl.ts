import {
  type UpdateBookReadingCommandHandler,
  type UpdateBookReadingPayload,
  type UpdateBookReadingResult,
} from './updateBookReadingCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class UpdateBookReadingCommandHandlerImpl implements UpdateBookReadingCommandHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateBookReadingPayload): Promise<UpdateBookReadingResult> {
    const { id, comment, rating, startedAt, endedAt } = payload;

    this.loggerService.debug({
      message: 'Updating BookReading...',
      id,
      comment,
      rating,
      startedAt,
      endedAt,
    });

    const bookReading = await this.bookReadingRepository.findBookReading({ id });

    if (!bookReading) {
      throw new ResourceNotFoundError({
        name: 'BookReading',
        id,
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

    const updatedBookReading = await this.bookReadingRepository.saveBookReading({
      bookReading,
    });

    this.loggerService.debug({
      message: 'BookReading updated.',
      id,
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
