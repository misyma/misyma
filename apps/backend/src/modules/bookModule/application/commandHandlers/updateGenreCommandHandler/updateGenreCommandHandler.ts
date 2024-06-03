import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface UpdateGenrePayload {
  readonly id: string;
  readonly name: string;
}

export interface UpdateGenreResult {
  readonly genre: Genre;
}

export type UpdateGenreCommandHandler = CommandHandler<UpdateGenrePayload, UpdateGenreResult>;
