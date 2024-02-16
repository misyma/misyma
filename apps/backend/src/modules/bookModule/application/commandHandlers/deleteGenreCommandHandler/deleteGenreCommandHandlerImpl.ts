import { type DeleteGenreCommandHandler, type DeleteGenrePayload } from './deleteGenreCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class DeleteGenreCommandHandlerImpl implements DeleteGenreCommandHandler {
  public constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(payload: DeleteGenrePayload): Promise<void> {
    const { id } = payload;

    const genre = await this.genreRepository.findById({
      id,
    });

    if (!genre) {
      throw new ResourceNotFoundError({
        name: 'Genre',
        id,
      });
    }

    await this.genreRepository.delete(genre);
  }
}
