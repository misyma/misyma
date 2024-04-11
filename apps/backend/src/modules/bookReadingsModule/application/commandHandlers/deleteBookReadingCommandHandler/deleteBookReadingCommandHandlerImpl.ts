import {
  type DeleteBookReadingCommandHandler,
  type DeleteBookReadingPayload,
} from './deleteBookReadingCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

export class DeleteBookReadingCommandHandlerImpl implements DeleteBookReadingCommandHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBookReadingPayload): Promise<void> {
    const { id } = payload;

    this.loggerService.debug({
      message: 'Deleting BookReading...',
      id,
    });

    const bookReading = await this.bookReadingRepository.findBookReading({ id });

    if (!bookReading) {
      throw new ResourceNotFoundError({
        resource: 'BookReading',
        id,
      });
    }

    await this.bookReadingRepository.deleteBookReading({ id });

    this.loggerService.debug({
      message: 'BookReading deleted...',
      id,
    });
  }
}
