import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export interface CreateGenrePayload {
  name: string;
}

export interface CreateGenreResult {
  genre: Genre;
}

export type CreateGenreCommandHandler = CommandHandler<CreateGenrePayload, CreateGenreResult>;
