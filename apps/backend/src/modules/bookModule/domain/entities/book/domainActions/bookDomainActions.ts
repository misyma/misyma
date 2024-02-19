import { type AddAuthorDomainAction } from './addAuthorDomainAction.js';
import { type DeleteAuthorDomainAction } from './deleteAuthorDomainAction.js';
import { type UpdateBackCoverImageUrlDomainAction } from './updateBackCoverImageUrlDomainAction.js';
import { type UpdateBookGenresAction } from './updateBookGenresAction.js';
import { type UpdateBookshelfDomainAction } from './updateBookshelfDomainAction.js';
import { type UpdateFormatDomainAction } from './updateFormatDomainAction.js';
import { type UpdateFrontCoverImageUrlDomainAction } from './updateFrontCoverImageUrlDomainAction.js';
import { type UpdateIsbnDomainAction } from './updateIsbnDomainAction.js';
import { type UpdateLanguageDomainAction } from './updateLanguageDomainAction.js';
import { type UpdatePagesDomainAction } from './updatePagesDomainAction.js';
import { type UpdatePublisherDomainAction } from './updatePublisherDomainAction.js';
import { type UpdateReleaseYearDomainAction } from './updateReleaseYear.js';
import { type UpdateStatusDomainAction } from './updateStatusDomainAction.js';
import { type UpdateTitleDomainAction } from './updateTitleDomainAction.js';
import { type UpdateTranslatorDomainAction } from './updateTranslatorDomainAction.js';

export type BookDomainAction =
  | AddAuthorDomainAction
  | DeleteAuthorDomainAction
  | UpdateTitleDomainAction
  | UpdateIsbnDomainAction
  | UpdatePublisherDomainAction
  | UpdateReleaseYearDomainAction
  | UpdateLanguageDomainAction
  | UpdateTranslatorDomainAction
  | UpdateFormatDomainAction
  | UpdatePagesDomainAction
  | UpdateFrontCoverImageUrlDomainAction
  | UpdateBackCoverImageUrlDomainAction
  | UpdateStatusDomainAction
  | UpdateBookshelfDomainAction
  | UpdateBookGenresAction;
