import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

import { type DeleteGenreCommandHandler, type DeleteGenrePayload } from './deleteGenreCommandHandler.js';

export class DeleteGenreCommandHandlerImpl implements DeleteGenreCommandHandler {
  public constructor(
    private readonly genreRepository: GenreRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteGenrePayload): Promise<void> {
    const { id } = payload;

    this.loggerService.debug({
      message: 'Deleting Genre...',
      id,
    });

    const genre = await this.genreRepository.findGenre({
      id,
    });

    if (!genre) {
      throw new ResourceNotFoundError({
        resource: 'Genre',
        id,
      });
    }

    await this.genreRepository.deleteGenre({ id: genre.getId() });

    this.loggerService.debug({
      message: 'Genre deleted.',
      id,
    });
  }
}
