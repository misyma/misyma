import {
  type UpdateUserBookCommandHandler,
  type UpdateUserBookPayload,
  type UpdateUserBookResult,
} from './updateUserBookCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class UpdateUserBookCommandHandlerImpl implements UpdateUserBookCommandHandler {
  public constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly genreRepository: GenreRepository,
    private readonly collectionRepository: CollectionRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateUserBookPayload): Promise<UpdateUserBookResult> {
    const { userBookId, bookshelfId, imageUrl, status, isFavorite, genreIds, collectionIds } = payload;

    this.loggerService.debug({
      message: 'Updating UserBook...',
      userBookId,
      bookshelfId,
      imageUrl,
      status,
      isFavorite,
      genreIds,
      collectionIds,
    });

    const userBook = await this.userBookRepository.findUserBook({ id: userBookId });

    if (!userBook) {
      throw new OperationNotValidError({
        reason: 'UserBook does not exist.',
        id: userBookId,
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

      userBook.setBookshelfId({ bookshelfId });
    }

    if (genreIds !== undefined) {
      const genres = await this.genreRepository.findGenres({
        ids: genreIds,
        page: 1,
        pageSize: genreIds.length,
      });

      if (genres.length !== genreIds.length) {
        throw new OperationNotValidError({
          reason: 'Some genres do not exist.',
          ids: genreIds,
        });
      }

      userBook.setGenres({ genres });
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
