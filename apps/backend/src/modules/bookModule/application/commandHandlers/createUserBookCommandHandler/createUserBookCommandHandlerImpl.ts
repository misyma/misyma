import {
  type CreateUserBookCommandHandler,
  type CreateUserBookCommandHandlerPayload,
  type CreateUserBookCommandHandlerResult,
} from './createUserBookCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type Collection } from '../../../domain/entities/collection/collection.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class CreateUserBookCommandHandlerImpl implements CreateUserBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
    private readonly genreRepository: GenreRepository,
    private readonly collectionRepository: CollectionRepository,
  ) {}

  public async execute(payload: CreateUserBookCommandHandlerPayload): Promise<CreateUserBookCommandHandlerResult> {
    const { userId, bookshelfId, bookId, status, imageUrl, genreId, collectionIds, isFavorite } = payload;

    this.loggerService.debug({
      message: 'Creating UserBook...',
      userId,
      bookshelfId,
      bookId,
      status,
      imageUrl,
      genreId,
      isFavorite,
      collectionIds,
    });

    const bookshelf = await this.bookshelfRepository.findBookshelf({ where: { id: bookshelfId } });

    if (!bookshelf) {
      throw new OperationNotValidError({
        reason: 'Bookshelf does not exist.',
        id: bookshelfId,
      });
    }

    if (bookshelf.getUserId() !== userId) {
      throw new OperationNotValidError({
        reason: 'Bookshelf does not belong to the user.',
        userId,
        bookshelfId,
      });
    }

    const book = await this.bookRepository.findBook({ id: bookId });

    if (!book) {
      throw new OperationNotValidError({
        reason: 'Book does not exist.',
        id: bookId,
      });
    }

    const existingUserBooksWithSameBook = await this.userBookRepository.findUserBooks({
      userId,
      bookId,
      isbn: book.getIsbn() ?? undefined,
      page: 1,
      pageSize: 1,
      expandFields: [],
    });

    if (existingUserBooksWithSameBook.length > 0) {
      throw new ResourceAlreadyExistsError({
        resource: 'UserBook',
        bookshelfId,
        bookId,
      });
    }

    const existingGenre = await this.genreRepository.findGenre({ id: genreId });

    if (!existingGenre) {
      throw new OperationNotValidError({
        reason: 'Genre does not exist.',
        id: genreId,
      });
    }

    let collections: Collection[] = [];

    if (collectionIds && collectionIds.length) {
      collections = await this.collectionRepository.findCollections({
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
    }

    const userBook = await this.userBookRepository.saveUserBook({
      userBook: {
        bookId,
        bookshelfId,
        status,
        isFavorite,
        createdAt: new Date(),
        imageUrl,
        genreId,
        collections,
        readings: [],
      },
    });

    this.loggerService.debug({
      message: 'UserBook created.',
      id: userBook.getId(),
      bookshelfId,
      bookId,
    });

    return { userBook };
  }
}
