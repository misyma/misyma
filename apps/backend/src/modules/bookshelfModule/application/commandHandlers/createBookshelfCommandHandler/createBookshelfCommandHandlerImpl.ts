import {
  type CreateBookshelfCommandHandler,
  type CreateBookshelfPayload,
  type CreateBookshelfResult,
} from './createBookshelfCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { BookshelfDraft } from '../../../domain/entities/bookshelf/bookshelfDraft/bookshelfDraft.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BookshelfUserRepository } from '../../../domain/repositories/bookshelfUserRepository/bookshelfUserRepository.js';

export class CreateBookshelfCommandHandlerImpl implements CreateBookshelfCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly bookshelfUserRepository: BookshelfUserRepository,
  ) {}

  public async execute(payload: CreateBookshelfPayload): Promise<CreateBookshelfResult> {
    const { name, userId, addressId } = payload;

    const userExists = await this.bookshelfUserRepository.exists({
      id: userId,
    });

    if (!userExists) {
      throw new ResourceNotFoundError({
        name: 'User',
      });
    }

    const bookshelfDraft = new BookshelfDraft({
      name,
      userId,
      addressId,
    });

    const bookshelf = await this.bookshelfRepository.save({
      entity: bookshelfDraft,
    });

    return {
      bookshelf,
    };
  }
}
