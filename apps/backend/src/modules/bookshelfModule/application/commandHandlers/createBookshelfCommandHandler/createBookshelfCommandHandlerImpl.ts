import { BookshelfType } from '@common/contracts';

import {
  type CreateBookshelfCommandHandler,
  type CreateBookshelfPayload,
  type CreateBookshelfResult,
} from './createBookshelfCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
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
    const { name, userId, type } = payload;

    this.loggerService.debug({
      message: 'Creating Bookshelf...',
      name,
      userId,
    });

    const existingUser = await this.userRepository.findUser({
      id: userId,
    });

    if (!existingUser) {
      throw new OperationNotValidError({
        reason: 'User does not exist.',
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
      throw new ResourceAlreadyExistsError({
        resource: 'Bookshelf',
        name,
        userId,
      });
    }

    const bookshelf = await this.bookshelfRepository.saveBookshelf({
      bookshelf: {
        name,
        userId,
        type: type ?? BookshelfType.standard,
      },
    });

    this.loggerService.debug({
      message: 'Bookshelf created.',
      id: bookshelf.getId(),
      name,
      userId,
    });

    return { bookshelf };
  }
}
