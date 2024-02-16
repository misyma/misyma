import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteGenrePayload {
  id: string;
}

export type DeleteGenreCommandHandler = CommandHandler<DeleteGenrePayload, void>;
