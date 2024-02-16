import {
  type CreateGenreCommandHandler,
  type CreateGenrePayload,
  type CreateGenreResult,
} from './createGenreCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class CreateGenreCommandHandlerImpl implements CreateGenreCommandHandler {
  public constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(payload: CreateGenrePayload): Promise<CreateGenreResult> {
    const { name } = payload;

    const normalizedName = name.toLowerCase();

    const genreExists = await this.genreRepository.findByName({
      name: normalizedName,
    });

    if (genreExists) {
      throw new OperationNotValidError({
        reason: 'Genre already exists.',
        name,
      });
    }

    const genre = await this.genreRepository.create({
      name: normalizedName,
    });

    return {
      genre,
    };
  }
}
