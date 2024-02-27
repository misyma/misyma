import {
  type UpdateBookshelfNameCommandHandler,
  type UpdateBookshelfNamePayload,
  type UpdateBookshelfNameResult,
} from './updateBookshelfNameCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class UpdateBookshelfNameCommandHandlerImpl implements UpdateBookshelfNameCommandHandler {
  public constructor(private readonly bookshelfRepository: BookshelfRepository) {}

  public async execute(payload: UpdateBookshelfNamePayload): Promise<UpdateBookshelfNameResult> {
    const { id, name, userId } = payload;

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

    return {
      bookshelf: updatedBookshelf,
    };
  }
}
