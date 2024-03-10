import {
  type FindGenreByNamePayload,
  type FindGenreByNameQueryHandler,
  type FindGenreByNameResult,
} from './findGenreByNameQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class FindGenreByNameQueryHandlerImpl implements FindGenreByNameQueryHandler {
  public constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(payload: FindGenreByNamePayload): Promise<FindGenreByNameResult> {
    const { name } = payload;

    const normalizedName = name.toLowerCase();

    const genre = await this.genreRepository.findGenre({
      name: normalizedName,
    });

    if (!genre) {
      throw new ResourceNotFoundError({
        name: 'Genre',
        genreName: name,
      });
    }

    return {
      genre,
    };
  }
}
