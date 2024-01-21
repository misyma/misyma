import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateLanguageDomainAction {
  readonly type: BookDomainActionType.updateLanguage;
  readonly payload: {
    readonly language: string;
  };
}
