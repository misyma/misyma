import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import {
  type DeleteUserBookCommandHandler,
  type DeleteUserBookCommandHandlerPayload,
} from './deleteUserBookCommandHandler.js';

export class DeleteUserBookCommandHandlerImpl implements DeleteUserBookCommandHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteUserBookCommandHandlerPayload): Promise<void> {
    const { userId, userBookId } = payload;

    this.loggerService.debug({
      message: "Deleting Users's book...",
      userBookId,
      userId,
    });

    const existingUserBook = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!existingUserBook) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    const existingBookshelf = await this.bookshelfRepository.findBookshelf({
      where: { id: existingUserBook.bookshelfId },
    });

    if (!existingBookshelf) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        id: existingUserBook.bookshelfId,
      });
    }

    if (existingBookshelf.getUserId() !== userId) {
      throw new OperationNotValidError({
        reason: 'User does not own this UserBook.',
        userId,
        userBookId,
      });
    }

    await this.userBookRepository.deleteUserBooks({ ids: [userBookId] });

    this.loggerService.debug({
      message: "User's book deleted.",
      userBookId,
    });
  }
}
