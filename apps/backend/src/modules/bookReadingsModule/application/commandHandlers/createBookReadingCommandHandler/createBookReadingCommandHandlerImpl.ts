import {
  type CreateBookReadingCommandHandler,
  type CreateBookReadingPayload,
  type CreateBookReadingResult,
} from './createBookReadingCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookRepository } from '../../../../bookModule/domain/repositories/bookRepository/bookRepository.js';
import { BookReadingDraft } from '../../../domain/entities/bookReading/bookReadingDraft/bookReadingDraft.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class CreateBookReadingCommandHandlerImpl implements CreateBookReadingCommandHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly bookRepository: BookRepository,
  ) {}

  public async execute(payload: CreateBookReadingPayload): Promise<CreateBookReadingResult> {
    const { bookId, comment, rating, startedAt, endedAt } = payload;

    const userExists = await this.bookRepository.findBook({
      id: bookId,
    });

    if (!userExists) {
      throw new ResourceNotFoundError({
        name: 'Book',
        id: bookId,
      });
    }

    const bookReadingDraft = new BookReadingDraft({
      bookId,
      comment,
      rating,
      startedAt,
      endedAt,
    });

    const bookReading = await this.bookReadingRepository.save({
      entity: bookReadingDraft,
    });

    return { bookReading };
  }
}
