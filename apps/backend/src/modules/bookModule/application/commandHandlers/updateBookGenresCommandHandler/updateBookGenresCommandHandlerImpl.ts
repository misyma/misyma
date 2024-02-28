import {
  type UpdateBookGenresCommandHandler,
  type UpdateBookGenresPayload,
  type UpdateBookGenresResult,
} from './updateBookGenresCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class UpdateBookGenresCommandHandlerImpl implements UpdateBookGenresCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly genreRepository: GenreRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateBookGenresPayload): Promise<UpdateBookGenresResult> {
    const { bookId, genreIds } = payload;

    this.loggerService.debug({
      message: 'Updating Book genres...',
      bookId,
      genreIds,
    });

    const book = await this.bookRepository.findBook({ id: bookId });

    if (!book) {
      throw new ResourceNotFoundError({
        name: 'Book',
        id: bookId,
      });
    }

    const genres = await this.genreRepository.findGenresByIds({
      ids: genreIds,
    });

    if (genres.length !== genreIds.length) {
      throw new ResourceNotFoundError({
        name: 'Genre',
        id: genreIds,
      });
    }

    book.setGenres({ genres });

    await this.bookRepository.saveBook({ book });

    this.loggerService.debug({
      message: 'Book genres updated.',
      bookId,
      genreIds,
    });

    return { book };
  }
}
