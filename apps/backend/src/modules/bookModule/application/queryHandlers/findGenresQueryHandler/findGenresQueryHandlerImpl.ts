import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';

import {
  type FindGenresResult,
  type FindGenresQueryHandler,
  type FindGenresPayload,
} from './findGenresQueryHandler.js';

export class FindGenresQueryHandlerImpl implements FindGenresQueryHandler {
  public constructor(private readonly genreRepository: GenreRepository) {}

  public async execute(payload: FindGenresPayload): Promise<FindGenresResult> {
    const { page, pageSize } = payload;

    const findGenresPayload = {
      page,
      pageSize,
    };

    const [genres, total] = await Promise.all([
      this.genreRepository.findGenres(findGenresPayload),
      this.genreRepository.countGenres(findGenresPayload),
    ]);

    return {
      genres,
      total,
    };
  }
}
