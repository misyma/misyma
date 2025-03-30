import { BookshelfType } from '@common/contracts';

import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BorrowingRepository } from '../../../domain/repositories/borrowingRepository/borrowingRepository.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

import {
  type UpdateUserBookCommandHandler,
  type UpdateUserBookPayload,
  type UpdateUserBookResult,
} from './updateUserBookCommandHandler.js';

export class UpdateUserBookCommandHandlerImpl implements UpdateUserBookCommandHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly collectionRepository: CollectionRepository,
    private readonly borrowingRepository: BorrowingRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateUserBookPayload): Promise<UpdateUserBookResult> {
    const { userId, userBookId, bookshelfId, imageUrl, status, isFavorite, genreId, collectionIds } = payload;

    this.loggerService.debug({
      message: 'Updating UserBook...',
      userId,
      userBookId,
      bookshelfId,
      imageUrl,
      status,
      isFavorite,
      genreId,
      collectionIds,
    });

    const userBook = await this.userBookRepository.findUserBook({ id: userBookId });

    if (!userBook) {
      throw new OperationNotValidError({
        reason: 'UserBook does not exist.',
        id: userBookId,
      });
    }

    const currentBookshelf = await this.bookshelfRepository.findBookshelf({
      where: { id: userBook.getBookshelfId() },
    });

    if (!currentBookshelf) {
      throw new OperationNotValidError({
        reason: 'Bookshelf does not exist.',
        id: userBook.getBookshelfId(),
      });
    }

    if (currentBookshelf.getUserId() !== userId) {
      throw new OperationNotValidError({
        reason: 'User does not own this UserBook.',
        userId,
        userBookId,
      });
    }

    if (bookshelfId) {
      const bookshelf = await this.bookshelfRepository.findBookshelf({ where: { id: bookshelfId } });

      if (!bookshelf) {
        throw new OperationNotValidError({
          reason: 'Bookshelf does not exist.',
          id: bookshelfId,
        });
      }

      // TODO: add transaction

      if (currentBookshelf.getType() === BookshelfType.borrowing) {
        const openBorrowings = await this.borrowingRepository.findBorrowings({
          userBookId,
          page: 1,
          pageSize: 1,
          isOpen: true,
        });

        const userBookBorrowing = openBorrowings[0];

        if (userBookBorrowing) {
          userBookBorrowing.setEndedAtDate({ endedAt: new Date() });

          await this.borrowingRepository.saveBorrowing({ borrowing: userBookBorrowing });
        }
      }

      userBook.setBookshelfId({ bookshelfId });
    }

    if (collectionIds !== undefined) {
      const collections = await this.collectionRepository.findCollections({
        ids: collectionIds,
        page: 1,
        pageSize: collectionIds.length,
      });

      if (collections.length !== collectionIds.length) {
        throw new OperationNotValidError({
          reason: 'Some collections do not exist.',
          ids: collectionIds,
        });
      }

      userBook.setCollections({ collections });
    }

    if (imageUrl !== undefined) {
      userBook.setImageUrl({ imageUrl });
    }

    if (status) {
      userBook.setStatus({ status });
    }

    if (isFavorite !== undefined) {
      userBook.setIsFavorite({ isFavorite });
    }

    await this.userBookRepository.saveUserBook({ userBook });

    this.loggerService.debug({
      message: 'UserBook updated.',
      userBookId,
    });

    return { userBook };
  }
}
