import {
  type DeleteBookReadingCommandHandler,
  type DeleteBookReadingPayload,
} from './deleteBookReadingCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class DeleteBookReadingCommandHandlerImpl implements DeleteBookReadingCommandHandler {
  public constructor(private readonly bookReadingRepository: BookReadingRepository) {}

  public async execute(payload: DeleteBookReadingPayload): Promise<void> {
    const { id } = payload;

    const bookReading = await this.bookReadingRepository.findById({ id });

    if (!bookReading) {
      throw new ResourceNotFoundError({
        name: 'BookReading',
        id,
      });
    }

    await this.bookReadingRepository.delete({ entity: bookReading });
  }
}
