import {
  type UpdateGenreNameCommandHandler,
  type UpdateGenreNamePayload,
  type UpdateGenreNameResult,
} from './updateGenreNameCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class UpdateGenreNameCommandHandlerImpl implements UpdateGenreNameCommandHandler {
  public constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(payload: UpdateGenreNamePayload): Promise<UpdateGenreNameResult> {
    const { id, name } = payload;

    const existingGenre = await this.genreRepository.findGenre({
      id,
    });

    if (!existingGenre) {
      throw new ResourceNotFoundError({
        name: 'Genre',
        id,
      });
    }

    const normalizedName = name.toLowerCase();

    const nameTaken = await this.genreRepository.findGenre({
      name: normalizedName,
    });

    if (nameTaken) {
      throw new OperationNotValidError({
        reason: 'Genre with this name already exists.',
        name,
      });
    }

    existingGenre.setName({
      name: normalizedName,
    });

    const genre = await this.genreRepository.saveGenre({
      genre: existingGenre,
    });

    return {
      genre,
    };
  }
}
