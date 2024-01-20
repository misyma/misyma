import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateTranslatorDomainAction {
  readonly type: BookDomainActionType.updateTranslator;
  readonly payload: {
    readonly translator: string;
  };
}
