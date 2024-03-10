import {
  type UpdateGenreNameCommandHandler,
  type UpdateGenreNamePayload,
  type UpdateGenreNameResult,
} from './updateGenreNameCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class UpdateGenreNameCommandHandlerImpl implements UpdateGenreNameCommandHandler {
  public constructor(
    private readonly genreRepository: GenreRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateGenreNamePayload): Promise<UpdateGenreNameResult> {
    const { id, name } = payload;

    const normalizedName = name.toLowerCase();

    this.loggerService.debug({
      message: 'Updating Genre name...',
      id,
      name: normalizedName,
    });

    const existingGenre = await this.genreRepository.findGenre({ id });

    if (!existingGenre) {
      throw new ResourceNotFoundError({
        name: 'Genre',
        id,
      });
    }

    const nameTaken = await this.genreRepository.findGenre({
      name: normalizedName,
    });

    if (nameTaken) {
      throw new OperationNotValidError({
        reason: 'Genre with this name already exists.',
        name,
      });
    }

    existingGenre.setName({ name: normalizedName });

    const genre = await this.genreRepository.saveGenre({
      genre: existingGenre,
    });

    this.loggerService.debug({
      message: 'Genre name updated.',
      id,
      name,
    });

    return {
      genre,
    };
  }
}
