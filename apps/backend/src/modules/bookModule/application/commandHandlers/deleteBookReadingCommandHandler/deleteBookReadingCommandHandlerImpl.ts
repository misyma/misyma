import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import {
  type DeleteBookReadingCommandHandler,
  type DeleteBookReadingPayload,
} from './deleteBookReadingCommandHandler.js';

export class DeleteBookReadingCommandHandlerImpl implements DeleteBookReadingCommandHandler {
  public constructor(
    private readonly bookReadingRepository: BookReadingRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBookReadingPayload): Promise<void> {
    const { userId, bookReadingId } = payload;

    this.loggerService.debug({
      message: 'Deleting BookReading...',
      id: bookReadingId,
    });

    const bookReading = await this.bookReadingRepository.findBookReading({ id: bookReadingId });

    if (!bookReading) {
      throw new ResourceNotFoundError({
        resource: 'BookReading',
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

    await this.bookReadingRepository.deleteBookReading({ id: bookReadingId });

    this.loggerService.debug({
      message: 'BookReading deleted.',
      id: bookReadingId,
    });
  }
}
