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

    const bookshelf = await this.bookshelfRepository.findByIdAndUserId({
      id,
      userId,
    });

    if (!bookshelf) {
      throw new ResourceNotFoundError({
        name: 'Bookshelf',
      });
    }

    bookshelf.addUpdateNameDomainAction({
      name,
    });

    const updatedBookshelf = await this.bookshelfRepository.save({
      entity: bookshelf,
    });

    return {
      bookshelf: updatedBookshelf,
    };
  }
}
