import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type UserBook } from '../../../domain/entities/userBook/userBook.js';

export interface UpdateUserBookGenresPayload {
  readonly genreIds: string[];
  readonly userBookId: string;
}

export interface UpdateUserBookGenresResult {
  readonly userBook: UserBook;
}

export type UpdateUserBookGenresCommandHandler = CommandHandler<
  UpdateUserBookGenresPayload,
  UpdateUserBookGenresResult
>;
