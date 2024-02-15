import {
  type UpdateGenreNameCommandHandler,
  type UpdateGenreNamePayload,
  type UpdateGenreNameResult,
} from './updateGenreNameCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Genre } from '../../../domain/entities/genre/genre.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class UpdateGenreNameCommandHandlerImpl implements UpdateGenreNameCommandHandler {
  public constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(payload: UpdateGenreNamePayload): Promise<UpdateGenreNameResult> {
    const { id, name } = payload;

    const genreExists = await this.genreRepository.findById({
      id,
    });

    if (!genreExists) {
      throw new ResourceNotFoundError({
        name: 'Genre',
        id,
      });
    }

    const nameTaken = await this.genreRepository.findByName({
      name,
    });

    if (nameTaken) {
      throw new OperationNotValidError({
        reason: 'Genre with this name already exists.',
        name,
      });
    }

    const genre = await this.genreRepository.update(
      new Genre({
        id,
        name,
      }),
    );

    return {
      genre,
    };
  }
}
