import {
  type UpdateBookReadingCommandHandler,
  type UpdateBookReadingPayload,
  type UpdateBookReadingResult,
} from './updateBookReadingCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class UpdateBookReadingCommandHandlerImpl implements UpdateBookReadingCommandHandler {
  public constructor(private readonly bookReadingRepository: BookReadingRepository) {}

  public async execute(payload: UpdateBookReadingPayload): Promise<UpdateBookReadingResult> {
    const { id, comment, rating, startedAt, endedAt } = payload;

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
      bookReading.setStartedDate({
        startedAt,
      });
    }

    if (endedAt !== undefined) {
      bookReading.setEndedDate({
        endedAt,
      });
    }

    const updatedBookReading = await this.bookReadingRepository.saveBookReading({
      bookReading,
    });

    return {
      bookReading: updatedBookReading,
    };
  }
}
