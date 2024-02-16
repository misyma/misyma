import { type FindGenresResult, type FindGenresQueryHandler } from './findGenresQueryHandler.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

export class FindGenresQueryHandlerImpl implements FindGenresQueryHandler {
  public constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(): Promise<FindGenresResult> {
    const genres = await this.genreRepository.findAll();

    return {
      genres,
    };
  }
}
