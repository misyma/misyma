import { type DeleteBookshelfCommandHandler, type DeleteBookshelfPayload } from './deleteBookshelfCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class DeleteBookshelfCommandHandlerImpl implements DeleteBookshelfCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBookshelfPayload): Promise<void> {
    const { bookshelfId, userId } = payload;

    this.loggerService.debug({
      message: 'Deleting Bookshelf...',
      bookshelfId,
      userId,
    });

    const existingBookshelf = await this.bookshelfRepository.findBookshelf({ where: { id: bookshelfId } });

    if (!existingBookshelf) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        bookshelfId,
        userId,
      });
    }

    if (userId !== existingBookshelf.getUserId()) {
      throw new OperationNotValidError({
        reason: 'User does not have permission to delete this bookshelf.',
        bookshelfId,
        userId,
      });
    }

    await this.bookshelfRepository.deleteBookshelf({ id: bookshelfId });

    this.loggerService.debug({
      message: 'Bookshelf deleted.',
      bookshelfId,
      userId,
    });
  }
}
