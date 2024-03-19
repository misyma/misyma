import { type Author } from './author.js';

export interface FindAuthorPathParams {
  readonly id: string;
}

export interface FindAuthorResponseBody extends Author {}
