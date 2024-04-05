import {
  type CreateBookshelfCommandHandler,
  type CreateBookshelfPayload,
  type CreateBookshelfResult,
} from './createBookshelfCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
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
    const { name, userId, address, imageUrl } = payload;

    this.loggerService.debug({
      message: 'Creating Bookshelf...',
      name,
      userId,
      address,
      imageUrl,
    });

    const existingUser = await this.userRepository.findUser({
      id: userId,
    });

    if (!existingUser) {
      throw new ResourceNotFoundError({
        name: 'User',
        id: userId,
      });
    }

    const existingBookshelf = await this.bookshelfRepository.findBookshelf({
      where: {
        userId,
        name,
      },
    });

    if (existingBookshelf) {
      throw new OperationNotValidError({
        reason: 'Bookshelf with this name already exists.',
        name,
        userId,
      });
    }

    const bookshelf = await this.bookshelfRepository.saveBookshelf({
      bookshelf: {
        name,
        userId,
        address,
        imageUrl,
      },
    });

    this.loggerService.debug({
      message: 'Bookshelf created.',
      id: bookshelf.getId(),
      name,
      userId,
      address,
      imageUrl,
    });

    return { bookshelf };
  }
}
