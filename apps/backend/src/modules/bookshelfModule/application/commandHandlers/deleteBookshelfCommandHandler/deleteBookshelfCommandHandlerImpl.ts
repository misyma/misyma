import { UserBookExpandField } from '@common/contracts';

import { type DeleteBookshelfCommandHandler, type DeleteBookshelfPayload } from './deleteBookshelfCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBookRepository } from '../../../../bookModule/domain/repositories/userBookRepository/userBookRepository.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

export class DeleteBookshelfCommandHandlerImpl implements DeleteBookshelfCommandHandler {
  public constructor(
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBookshelfPayload): Promise<void> {
    const { bookshelfId, userId, fallbackBookshelfId } = payload;

    this.loggerService.debug({
      message: 'Deleting Bookshelf...',
      bookshelfId,
      userId,
    });

    const existingBookshelf = await this.bookshelfRepository.findBookshelf({ where: { id: bookshelfId } });

    if (!existingBookshelf) {
      throw new ResourceNotFoundError({
        resource: 'Bookshelf',
        bookshelfId,
        userId,
      });
    }

    if (userId !== existingBookshelf.getUserId()) {
      throw new OperationNotValidError({
        reason: 'User does not have permission to delete this bookshelf.',
        bookshelfId,
        userId,
      });
    }

    if (fallbackBookshelfId) {
      const existingFallbackBookshelf = await this.bookshelfRepository.findBookshelf({
        where: { id: fallbackBookshelfId },
      });

      if (!existingFallbackBookshelf) {
        throw new ResourceNotFoundError({
          resource: 'Bookshelf',
          bookshelfId: fallbackBookshelfId,
          userId,
        });
      }

      if (userId !== existingFallbackBookshelf.getUserId()) {
        throw new OperationNotValidError({
          reason: 'User does not have permission to move books to this bookshelf.',
          bookshelfId: fallbackBookshelfId,
          userId,
        });
      }

      await this.moveUserBooksToOtherBookshelf(bookshelfId, fallbackBookshelfId);
    }

    await this.bookshelfRepository.deleteBookshelf({ id: bookshelfId });

    this.loggerService.debug({
      message: 'Bookshelf deleted.',
      bookshelfId,
      userId,
    });
  }

  public async moveUserBooksToOtherBookshelf(bookshelfId: string, otherBookshelfId: string): Promise<void> {
    const userBooks = await this.userBookRepository.findUserBooks({
      bookshelfId,
      expandFields: [UserBookExpandField.collections, UserBookExpandField.readings],
    });

    if (!userBooks.length) {
      this.loggerService.debug({
        message: 'No books to move to other bookshelf.',
        bookshelfId,
        otherBookshelfId,
      });

      return;
    }

    this.loggerService.debug({
      message: 'Moving books to other bookshelf...',
      bookshelfId,
      otherBookshelfId,
      count: userBooks.length,
    });

    userBooks.forEach((userBook) => {
      userBook.setBookshelfId({ bookshelfId: otherBookshelfId });
    });

    await this.userBookRepository.saveUserBooks({ userBooks });

    this.loggerService.debug({
      message: 'Books moved to other bookshelf.',
      bookshelfId,
      otherBookshelfId,
      count: userBooks.length,
    });
  }
}
