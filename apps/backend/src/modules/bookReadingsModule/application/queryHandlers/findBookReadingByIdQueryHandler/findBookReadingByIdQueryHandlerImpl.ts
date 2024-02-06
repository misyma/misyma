import {
  type FindBookReadingByIdPayload,
  type FindBookReadingByIdQueryHandler,
  type FindBookReadingByIdResult,
} from './findBookReadingByIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class FindBookReadingByIdQueryHandlerImpl implements FindBookReadingByIdQueryHandler {
  public constructor(private readonly bookReadingRepository: BookReadingRepository) {}

  public async execute(payload: FindBookReadingByIdPayload): Promise<FindBookReadingByIdResult> {
    const { id } = payload;

    const bookReading = await this.bookReadingRepository.findById({ id });

    if (!bookReading) {
      throw new ResourceNotFoundError({
        name: 'BookReading',
      });
    }

    return {
      bookReading,
    };
  }
}
