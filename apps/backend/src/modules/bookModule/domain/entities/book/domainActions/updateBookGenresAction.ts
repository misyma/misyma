import { type BookDomainActionType } from './bookDomainActionType.js';
import { type Genre } from '../../genre/genre.js';

export interface UpdateBookGenresAction {
  readonly type: BookDomainActionType.updateBookGenres;
  readonly payload: {
    readonly addedGenres: Genre[];
    readonly removedGenres: Genre[];
  };
}
