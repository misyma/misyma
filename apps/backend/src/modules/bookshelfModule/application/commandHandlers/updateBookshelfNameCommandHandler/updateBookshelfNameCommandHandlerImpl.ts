import {
  type UpdateBookshelfNameCommandHandler,
  type UpdateBookshelfNamePayload,
  type UpdateBookshelfNameResult,
} from './updateBookshelfNameCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class UpdateBookshelfNameCommandHandlerImpl implements UpdateBookshelfNameCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateBookshelfNamePayload): Promise<UpdateBookshelfNameResult> {
    const { id, name, userId } = payload;

    this.loggerService.debug({
      message: 'Updating Bookshelf name...',
      id,
      name,
      userId,
    });

    const bookshelf = await this.bookshelfRepository.findBookshelf({
      id,
      userId,
    });

    if (!bookshelf) {
      throw new ResourceNotFoundError({
        name: 'Bookshelf',
      });
    }

    bookshelf.setName({ name });

    const updatedBookshelf = await this.bookshelfRepository.saveBookshelf({ bookshelf });

    this.loggerService.debug({
      message: 'Bookshelf name updated...',
      id,
      name,
      userId,
    });

    return {
      bookshelf: updatedBookshelf,
    };
  }
}
