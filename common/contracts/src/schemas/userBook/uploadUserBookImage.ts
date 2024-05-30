import { type UserBook } from './userBook.js';

export interface UploadUserBookImagePathParams {
  readonly userBookId: string;
}

export type UploadUserBookImageResponseBody = UserBook;
