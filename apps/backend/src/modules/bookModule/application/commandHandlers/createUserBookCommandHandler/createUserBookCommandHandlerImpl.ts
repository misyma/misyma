import {
  type CreateUserBookCommandHandler,
  type CreateUserBookCommandHandlerPayload,
  type CreateUserBookCommandHandlerResult,
} from './createUserBookCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookshelfRepository } from '../../../../bookshelfModule/domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';

export class CreateUserBookCommandHandlerImpl implements CreateUserBookCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly bookshelfRepository: BookshelfRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
    private readonly genreRepository: GenreRepository,
  ) {}

  public async execute(payload: CreateUserBookCommandHandlerPayload): Promise<CreateUserBookCommandHandlerResult> {
    const { bookshelfId, bookId, status, imageUrl, genreIds, isFavorite } = payload;

    this.loggerService.debug({
      message: 'Creating UserBook...',
      bookshelfId,
      bookId,
      status,
      imageUrl,
      genreIds,
      isFavorite,
    });

    const bookshelf = await this.bookshelfRepository.findBookshelf({ where: { id: bookshelfId } });

    if (!bookshelf) {
      throw new OperationNotValidError({
        reason: 'Bookshelf does not exist.',
        id: bookshelfId,
      });
    }

    const book = await this.bookRepository.findBook({ id: bookId });

    if (!book) {
      throw new OperationNotValidError({
        reason: 'Book does not exist.',
        id: bookId,
      });
    }

    const existingUserBook = await this.userBookRepository.findUserBook({
      bookshelfId,
      bookId,
    });

    if (existingUserBook) {
      throw new OperationNotValidError({
        reason: 'UserBook already exists.',
        bookshelfId,
        bookId,
      });
    }

    let genres: Genre[] = [];

    if (genreIds) {
      genres = await this.genreRepository.findGenres({
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
    }

    const userBook = await this.userBookRepository.saveUserBook({
      userBook: {
        bookId,
        bookshelfId,
        status,
        isFavorite,
        imageUrl,
        genres,
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
