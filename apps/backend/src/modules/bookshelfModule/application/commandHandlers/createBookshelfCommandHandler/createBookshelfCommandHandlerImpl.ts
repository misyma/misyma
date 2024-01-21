import {
  type CreateBookshelfCommandHandler,
  type CreateBookshelfPayload,
  type CreateBookshelfResult,
} from './createBookshelfCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserRepository } from '../../../../userModule/domain/repositories/userRepository/userRepository.js';
import { BookshelfDraft } from '../../../domain/entities/bookshelf/bookshelfDraft/bookshelfDraft.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class CreateBookshelfCommandHandlerImpl implements CreateBookshelfCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(payload: CreateBookshelfPayload): Promise<CreateBookshelfResult> {
    const { name, userId, addressId } = payload;

    const userExists = await this.userRepository.findUser({
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
