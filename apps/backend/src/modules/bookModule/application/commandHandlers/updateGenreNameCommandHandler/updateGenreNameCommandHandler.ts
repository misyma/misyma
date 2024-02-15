import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface UpdateGenreNamePayload {
  readonly id: string;
  readonly name: string;
}

export interface UpdateGenreNameResult {
  genre: Genre;
}

export type UpdateGenreNameCommandHandler = CommandHandler<UpdateGenreNamePayload, UpdateGenreNameResult>;
