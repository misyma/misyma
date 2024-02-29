import {
  type FindBookReadingsByBookIdPayload,
  type FindBookReadingsByBookIdQueryHandler,
  type FindBookReadingsByBookIdResult,
} from './findBookReadingsByBookIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookRepository } from '../../../../bookModule/domain/repositories/bookRepository/bookRepository.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class FindBookReadingsByBookIdQueryHandlerImpl implements FindBookReadingsByBookIdQueryHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly bookRepository: BookRepository,
  ) {}

  public async execute(payload: FindBookReadingsByBookIdPayload): Promise<FindBookReadingsByBookIdResult> {
    const { bookId } = payload;

    const bookExists = await this.bookRepository.findBook({
      id: bookId,
    });

    if (!bookExists) {
      throw new ResourceNotFoundError({
        name: 'Book',
        id: bookId,
      });
    }

    const bookReadings = await this.bookReadingRepository.findBookReadings({
      bookId,
    });

    return { bookReadings };
  }
}
