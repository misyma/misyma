import {
  type FindGenreByIdPayload,
  type FindGenreByIdQueryHandler,
  type FindGenreByIdResult,
} from './findGenreByIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class FindGenreByIdQueryHandlerImpl implements FindGenreByIdQueryHandler {
  public constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(payload: FindGenreByIdPayload): Promise<FindGenreByIdResult> {
    const { id } = payload;

    const genre = await this.genreRepository.findGenre({
      id,
    });

    if (!genre) {
      throw new ResourceNotFoundError({
        resource: 'Genre',
        id,
      });
    }

    return {
      genre,
    };
  }
}
