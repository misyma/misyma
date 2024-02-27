import {
  type CreateBookshelfCommandHandler,
  type CreateBookshelfPayload,
  type CreateBookshelfResult,
} from './createBookshelfCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserRepository } from '../../../../userModule/domain/repositories/userRepository/userRepository.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class CreateBookshelfCommandHandlerImpl implements CreateBookshelfCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async execute(payload: CreateBookshelfPayload): Promise<CreateBookshelfResult> {
    const { name, userId, addressId } = payload;

    const existingUser = await this.userRepository.findUser({
      id: userId,
    });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'User',
      });
    }

    const bookshelf = await this.bookshelfRepository.saveBookshelf({
      bookshelf: {
        name,
        userId,
        addressId,
      },
    });

    return {
      bookshelf,
    };
  }
}
