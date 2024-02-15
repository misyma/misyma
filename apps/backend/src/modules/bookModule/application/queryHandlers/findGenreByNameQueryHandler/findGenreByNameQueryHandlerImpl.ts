import {
  type FindGenreByNamePayload,
  type FindGenreByNameQueryHandler,
  type FindGenreByNameResult,
} from './findGenreByNameQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class FindGenreByNameQueryHandlerImpl implements FindGenreByNameQueryHandler {
  public constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(payload: FindGenreByNamePayload): Promise<FindGenreByNameResult> {
    const { name } = payload;

    const genre = await this.genreRepository.findByName({
      name,
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
