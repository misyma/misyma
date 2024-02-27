import {
  type CreateBookReadingCommandHandler,
  type CreateBookReadingPayload,
  type CreateBookReadingResult,
} from './createBookReadingCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookRepository } from '../../../../bookModule/domain/repositories/bookRepository/bookRepository.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class CreateBookReadingCommandHandlerImpl implements CreateBookReadingCommandHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly bookRepository: BookRepository,
  ) {}

  public async execute(payload: CreateBookReadingPayload): Promise<CreateBookReadingResult> {
    const { bookId, comment, rating, startedAt, endedAt } = payload;

    const existingBook = await this.bookRepository.findBook({
      id: bookId,
    });

    if (!existingBook) {
      throw new ResourceNotFoundError({
        name: 'Book',
        id: bookId,
      });
    }

    const bookReading = await this.bookReadingRepository.saveBookReading({
      bookReading: {
        bookId,
        comment,
        rating,
        startedAt,
        endedAt,
      },
    });

    return { bookReading };
  }
}
