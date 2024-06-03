import {
  type UpdateGenreCommandHandler,
  type UpdateGenrePayload,
  type UpdateGenreResult,
} from './updateGenreCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class UpdateGenreCommandHandlerImpl implements UpdateGenreCommandHandler {
  public constructor(
    private readonly genreRepository: GenreRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateGenrePayload): Promise<UpdateGenreResult> {
    const { id, name } = payload;

    const normalizedName = name.toLowerCase();

    this.loggerService.debug({
      message: 'Updating Genre...',
      id,
      name: normalizedName,
    });

    const existingGenre = await this.genreRepository.findGenre({ id });

    if (!existingGenre) {
      throw new OperationNotValidError({
        reason: 'Genre does not exist.',
        id,
      });
    }

    const nameTaken = await this.genreRepository.findGenre({
      name: normalizedName,
    });

    if (nameTaken) {
      throw new ResourceAlreadyExistsError({
        resource: 'Genre',
        name,
      });
    }

    existingGenre.setName({ name: normalizedName });

    const genre = await this.genreRepository.saveGenre({
      genre: existingGenre,
    });

    this.loggerService.debug({
      message: 'Genre updated.',
      id,
      name: normalizedName,
    });

    return {
      genre,
    };
  }
}
