import {
  type CreateBookshelfCommandHandler,
  type CreateBookshelfPayload,
  type CreateBookshelfResult,
} from './createBookshelfCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserRepository } from '../../../../userModule/domain/repositories/userRepository/userRepository.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class CreateBookshelfCommandHandlerImpl implements CreateBookshelfCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateBookshelfPayload): Promise<CreateBookshelfResult> {
    const { name, userId, addressId } = payload;

    this.loggerService.debug({
      message: 'Creating Bookshelf...',
      name,
      userId,
      addressId,
    });

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

    this.loggerService.debug({
      message: 'Bookshelf created.',
      id: bookshelf.getId(),
      name,
      userId,
      addressId,
    });

    return {
      bookshelf,
    };
  }
}
