import {
  type UpdateBookGenresCommandHandler,
  type UpdateBookGenresPayload,
  type UpdateBookGenresResult,
} from './updateBookGenresCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class UpdateBookGenresCommandHandlerImpl implements UpdateBookGenresCommandHandler {
  public constructor(
    private readonly bookRepository: BookRepository,
    private readonly genreRepository: GenreRepository,
  ) {}

  public async execute(payload: UpdateBookGenresPayload): Promise<UpdateBookGenresResult> {
    const { bookId, genreIds } = payload;

    const book = await this.bookRepository.findBook({
      id: bookId,
    });

    if (!book) {
      throw new ResourceNotFoundError({
        name: 'Book',
        id: bookId,
      });
    }

    const genres = await this.genreRepository.findManyByIds({
      ids: genreIds,
    });

    if (genres.length !== genreIds.length) {
      throw new ResourceNotFoundError({
        name: 'Genre',
        id: genreIds,
      });
    }

    book.setGenres({
      genres,
    });

    await this.bookRepository.updateBook({
      book,
    });

    return {
      book,
    };
  }
}
