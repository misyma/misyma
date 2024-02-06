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

    const bookReading = await this.bookReadingRepository.findById({ id });

    if (!bookReading) {
      throw new ResourceNotFoundError({
        name: 'BookReading',
        id,
      });
    }

    if (comment !== undefined) {
      bookReading.addUpadateCommentDomainAction({
        comment,
      });
    }

    if (rating !== undefined) {
      bookReading.addUpdateRatingDomainAction({
        rating,
      });
    }

    if (startedAt !== undefined) {
      bookReading.addUpdateStartedDateDomainAction({
        startedAt,
      });
    }

    if (endedAt !== undefined) {
      bookReading.addUpdateEndedDateDomainAction({
        endedAt,
      });
    }

    const updatedBookReading = await this.bookReadingRepository.save({
      entity: bookReading,
    });

    return {
      bookReading: updatedBookReading,
    };
  }
}
